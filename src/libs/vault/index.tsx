import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import env from "../../environment";
import {
  createActiveSession,
  deleteActiveSession,
} from "./utils/createActiveSession";
import { Seed } from "../sismo-client";
import {
  CommitmentMapper,
  ImportedAccount,
  Owner,
  RecoveryKey,
  SismoWallet,
  Vault,
  VaultClient,
  WalletPurpose,
} from "../vault-client";
import { AwsStore } from "../vault-client/stores/aws-store";
import { useVaultState } from "./useVaultState";
import { getSeedActiveSession } from "./utils/getSeedActiveSession";

type ReactVault = {
  mnemonics: string[];
  vaultName: string;
  loadingActiveSession: boolean;
  autoImportOwners: boolean;
  keepConnected: boolean;
  importedAccounts: ImportedAccount[];
  owners: Owner[];
  connectedOwner: Owner;
  isConnected: boolean;
  deletable: boolean;
  recoveryKeys: RecoveryKey[];
  commitmentMapper: CommitmentMapper;
  getVaultSecret: (owner: Owner) => Promise<string>;
  disconnect: () => void;
  connect: (owner: Owner) => Promise<boolean>;
  isVaultExist: (owner: Owner) => Promise<boolean>;
  getRecoveryKey: (
    mnemonic?: string,
    accountNumber?: number
  ) => Promise<RecoveryKey>;
  getNextSeed: (
    owner: Owner,
    purpose: WalletPurpose
  ) => Promise<{ seed: string; mnemonic: string; accountNumber: number }>;
  generateRecoveryKey: (owner: Owner, name: string) => Promise<string>;
  deleteRecoveryKey: (owner: Owner, name: string) => Promise<string>;
  createFromOwner: (owner: Owner, name: string) => Promise<void>;
  createFromRecoveryKey: (
    recoveryKey: RecoveryKey,
    name: string
  ) => Promise<void>;
  importAccount: (owner: Owner, account: ImportedAccount) => Promise<void>;
  deleteImportedAccount: (
    owner: Owner,
    account: ImportedAccount
  ) => Promise<void>;
  merge: (ownerMain: Owner, ownerMerged: Owner) => Promise<void>;
  addOwner: (owner: Owner, ownerAdded: Owner) => Promise<Vault>;
  deleteOwners: (owner: Owner, ownersDeleted: Owner[]) => Promise<void>;
  updateAutoImportOwners: (
    owner: Owner,
    autoImportOwners: boolean
  ) => Promise<void>;
  updateName: (owner: Owner, name: string) => Promise<void>;
  deleteVault: (owner: Owner) => Promise<void>;
  updateKeepConnected: (owner: Owner, keepConnected: boolean) => Promise<void>;
};

export const useVault = (): ReactVault => {
  return useContext(SismoVaultContext);
};

export const SismoVaultContext = React.createContext(null);

type Props = {
  vaultUrl: string;
  children: ReactNode;
};

export default function SismoVaultProvider({
  vaultUrl,
  children,
}: Props): JSX.Element {
  const vaultClient = useMemo(() => {
    if (!vaultUrl) return;
    const awsStore = new AwsStore({ vaultUrl: vaultUrl });
    return new VaultClient(awsStore);
  }, [vaultUrl]);
  const vaultState = useVaultState();

  const connect = async (owner: Owner): Promise<boolean> => {
    const vault = await vaultClient.load(owner.seed);
    console.log("vault connected", vault);
    if (!vault) return false;
    await Promise.all([
      vaultState.updateConnectedOwner(owner),
      vaultState.updateVaultState(vault),
    ]);
    if (vault.settings.keepConnected) {
      createActiveSession(owner, 24 * 30 * 24);
    }
    return true;
  };

  const [loadingActiveSession, setLoadingActiveSession] = useState(true);
  useEffect(() => {
    const owner = getSeedActiveSession();
    if (!owner) {
      setTimeout(() => {
        setLoadingActiveSession(false);
      }, 100);
      return;
    }
    if (!owner) return;
    const loadActiveSession = async (owner: Owner) => {
      await connect(owner);
      setTimeout(() => {
        setLoadingActiveSession(false);
      }, 100);
    };
    loadActiveSession(owner);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVaultExist = async (owner: Owner): Promise<boolean> => {
    const vault = await vaultClient.load(owner.seed);
    if (!vault) return false;
    return true;
  };

  const disconnect = (): void => {
    vaultState.reset();
    deleteActiveSession();
  };

  const createFromOwner = async (
    owner: Owner,
    name: string
  ): Promise<boolean> => {
    const vault = await vaultClient.createFromOwner(owner, name);
    if (!vault) return false;
    return true;
  };

  const createFromRecoveryKey = async (
    recoveryKey: RecoveryKey,
    name: string
  ): Promise<boolean> => {
    const vault = await vaultClient.createFromRecoveryKey(recoveryKey, name);
    if (!vault) return false;
    return true;
  };

  const getRecoveryKey = async (
    mnemonic?: string,
    accountNumber?: number
  ): Promise<RecoveryKey> => {
    return await vaultClient.getRecoveryKey(mnemonic, accountNumber);
  };

  const getVaultSecret = async (owner: Owner): Promise<string> => {
    return await vaultClient.getVaultSecret(owner);
  };

  const getMnemonic = async (owner: Owner) => {
    const vault = await vaultClient.load(owner.seed);
    let mnemonic;
    if (vault.mnemonics.length === 0) {
      const vault = await vaultClient.generateMnemonic(owner);
      await vaultState.updateVaultState(vault);
      mnemonic = vault.mnemonics[0];
    } else {
      mnemonic = vault.mnemonics[0];
    }
    return mnemonic;
  };

  //TODO Put this logic in the vault-client
  const getNextSeed = async (
    owner: Owner,
    purpose: WalletPurpose
  ): Promise<{ seed: string; mnemonic: string; accountNumber: number }> => {
    let mnemonic = await getMnemonic(owner);
    if (purpose === WalletPurpose.IMPORTED_ACCOUNT) {
      const accountNumber = vaultState.importedAccounts.filter(
        (account) => account.wallet && account.wallet.mnemonic === mnemonic
      ).length;
      const wallet = new SismoWallet(mnemonic);
      const account = wallet.getAccount(purpose, accountNumber);
      const message = Seed.getSeedMsg(account);
      const signature = await wallet.sign(purpose, accountNumber, message);
      return {
        seed: Seed.generateSeed(signature),
        accountNumber: accountNumber,
        mnemonic: mnemonic,
      };
    }
  };

  const generateRecoveryKey = async (
    owner: Owner,
    name: string
  ): Promise<string> => {
    let mnemonic = await getMnemonic(owner);
    const vault = await vaultClient.generateRecoveryKey(owner, name);
    await vaultState.updateVaultState(vault);
    const accountNumber =
      vault.recoveryKeys.filter((key) => key.mnemonic === mnemonic).length - 1;
    const recoveryKeyGenerated = vault.recoveryKeys.find(
      (recoveryKey) =>
        recoveryKey.mnemonic === mnemonic &&
        recoveryKey.accountNumber === accountNumber
    );
    return recoveryKeyGenerated.key;
  };

  const deleteRecoveryKey = async (
    owner: Owner,
    key: string
  ): Promise<void> => {
    const vault = await vaultClient.deleteRecoveryKey(owner, key);
    await vaultState.updateVaultState(vault);
  };

  const importAccount = async (
    owner: Owner,
    account: ImportedAccount
  ): Promise<void> => {
    const vault = await vaultClient.importAccount(owner, account);
    if (account.type === "ethereum" && vaultState.autoImportOwners) {
      if (
        !vault.owners.find((owner) => owner.identifier === account.identifier)
      ) {
        await addOwner(owner, account);
        return;
      }
    }
    await vaultState.updateVaultState(vault);
  };

  const deleteImportedAccount = async (
    owner: Owner,
    account: ImportedAccount
  ): Promise<void> => {
    const vault = await vaultClient.deleteImportedAccount(owner, account);
    await vaultState.updateVaultState(vault);
  };

  const merge = async (ownerMain: Owner, ownerMerged: Owner): Promise<void> => {
    const vault = await vaultClient.merge(ownerMain, ownerMerged);
    await vaultState.updateVaultState(vault);
  };

  const addOwner = async (owner: Owner, ownerAdded: Owner): Promise<void> => {
    const vault = await vaultClient.addOwner(owner, ownerAdded);
    await vaultState.updateVaultState(vault);
  };

  const deleteOwners = async (
    owner: Owner,
    ownersDeleted: Owner[]
  ): Promise<void> => {
    const vault = await vaultClient.deleteOwners(owner, ownersDeleted);
    await vaultState.updateVaultState(vault);
  };

  const updateAutoImportOwners = async (
    owner: Owner,
    autoImportOwners: boolean
  ): Promise<void> => {
    const vault = await vaultClient.updateAutoImportOwners(
      owner,
      autoImportOwners
    );
    await vaultState.updateVaultState(vault);
  };

  const updateKeepConnected = async (
    owner: Owner,
    keepConnected: boolean
  ): Promise<void> => {
    const vault = await vaultClient.updateKeepConnected(owner, keepConnected);
    if (!keepConnected) {
      deleteActiveSession();
    } else {
      createActiveSession(owner, 24 * 30 * 3);
    }
    await vaultState.updateVaultState(vault);
  };

  const updateName = async (owner: Owner, name: string): Promise<void> => {
    const vault = await vaultClient.updateName(owner, name);
    await vaultState.updateVaultState(vault);
  };

  const deleteVault = async (owner: Owner): Promise<void> => {
    await vaultClient.delete(owner);
    await vaultState.reset();
  };

  const commitmentMapper = useMemo(
    () =>
      new CommitmentMapper({
        url: env.commitmentMapperUrl,
      }),
    []
  );

  return (
    <SismoVaultContext.Provider
      value={{
        loadingActiveSession,
        commitmentMapper,
        keepConnected: vaultState.keepConnected,
        vaultName: vaultState.vaultName,
        autoImportOwners: vaultState.autoImportOwners,
        importedAccounts: vaultState.importedAccounts,
        owners: vaultState.owners,
        connectedOwner: vaultState.connectedOwner,
        isConnected: Boolean(vaultState.connectedOwner),
        deletable: vaultState.deletable,
        recoveryKeys: vaultState.recoveryKeys,
        getVaultSecret,
        getRecoveryKey,
        deleteRecoveryKey,
        generateRecoveryKey,
        disconnect,
        createFromOwner,
        createFromRecoveryKey,
        getNextSeed,
        connect,
        isVaultExist,
        importAccount,
        deleteImportedAccount,
        merge,
        addOwner,
        deleteOwners,
        updateAutoImportOwners,
        updateName,
        deleteVault,
        updateKeepConnected,
      }}
    >
      {children}
    </SismoVaultContext.Provider>
  );
}
