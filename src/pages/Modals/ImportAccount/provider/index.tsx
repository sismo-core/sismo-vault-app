import env from "../../../../environment";
import React, { useContext, useState } from "react";
import { CommitmentMapper, Seed } from "../../../../libs/sismo-client";
import {
  AccountType,
  ImportedAccount,
  WalletPurpose,
} from "../../../../libs/vault-client";
import { useVault } from "../../../../hooks/vault";
import * as Sentry from "@sentry/react";
import { useNotifications } from "../../../../components/Notifications/provider";

type ImportAccountHook = {
  open: (args?: {
    importType: "account" | "owner";
    accountTypes?: AccountType[];
    importTarget?: string;
  }) => void;
  close: () => void;
  importing: "account" | "owner";
  lastImportedAccount: ImportedAccount;
  importTarget: string;
  accountTypes: AccountType[];
  importEthereum: (
    address: string,
    seedSignature: string,
    ownershipSignature: string,
    importType: "account" | "owner"
  ) => void;
  importGithub: (githubCode: string) => void;
  importTelegram: (telegramPayload: string) => void;
  importTwitter: (twitterOauth: {
    oauthToken: string;
    oauthVerifier: string;
  }) => void;
  importTwitterV2: (twitterOauth: {
    callback: string;
    twitterCode: string;
  }) => void;
  isOpen: boolean;
  importType: "account" | "owner";
};

export const useImportAccount = (): ImportAccountHook => {
  return useContext(ModalsContext);
};

export const ModalsContext = React.createContext(null);

export default function ImportAccountModalProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [isOpen, setIsOpen] = useState(null);
  const [importTarget, setImportTarget] = useState<string>(null);
  const [importType, setImportType] = useState<"account" | "owner">(null);
  const [accountTypes, setAccountTypes] = useState(null);
  const vault = useVault();
  const { notificationAdded } = useNotifications();
  const [importing, setImporting] = useState<"account" | "owner">(null);
  const [lastImportedAccount, setLastImportedAccount] = useState(null);

  const open = (args: {
    importType: "account" | "owner";
    accountTypes?: AccountType[];
    importTarget?: string;
  }) => {
    setImportType(args.importType);
    setImportTarget(args.importTarget ? args.importTarget.toLowerCase() : null);
    let _accountTypes = null;
    if (args) {
      if (args.accountTypes) {
        _accountTypes = args.accountTypes;
      }
    }
    setAccountTypes(_accountTypes);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setImportType(null);
    setImportTarget(null);
    setAccountTypes(null);
  };

  const triggerError = (e: Error) => {
    Sentry.withScope(function (scope) {
      scope.setLevel("fatal");
      Sentry.captureException(e);
    });
    console.error(e);
    notificationAdded({
      text: "An error occurred while saving your vault, please try again.",
      type: "error",
    });
    setImporting(null);
  };

  const importEthereum = async (
    identifier: string,
    seedSignature: string,
    ownershipSignature: string,
    _importType: "account" | "owner"
  ) => {
    setImporting(_importType);
    setLastImportedAccount(null);

    const alreadyOwner = vault.owners.find(
      (el) => el.identifier === identifier
    );
    const alreadyImported = vault.importedAccounts.find(
      (el) => el.identifier === identifier
    );

    let seed;
    if (alreadyImported || alreadyOwner) {
      if (alreadyImported) seed = alreadyImported.seed;
      if (alreadyOwner) seed = alreadyOwner.seed;
    } else {
      seed = Seed.generateSeed(seedSignature);
    }

    if (_importType === "owner") {
      if (alreadyOwner) {
        triggerError(new Error("Already imported as Owner"));
        return;
      }
      await vault.addOwner({
        identifier: identifier,
        seed: seed,
        timestamp: Date.now(),
      });
    } else {
      let commitmentReceipt;
      let commitmentMapperPubKey;
      if (alreadyImported) {
        commitmentReceipt = alreadyImported.commitmentReceipt;
        commitmentMapperPubKey = alreadyImported.commitmentMapperPubKey;
      } else {
        try {
          const commitmentMapperSecret =
            CommitmentMapper.generateCommitmentMapperSecret(seed);
          const vaultSecret = await vault.getVaultSecret();

          const {
            commitmentReceipt: _commitmentReceipt,
            commitmentMapperPubKey: _commitmentMapperPubKey,
          } = await vault.commitmentMapper.getEthereumCommitmentReceipt(
            identifier,
            ownershipSignature,
            commitmentMapperSecret,
            vaultSecret
          );

          commitmentReceipt = _commitmentReceipt;
          commitmentMapperPubKey = _commitmentMapperPubKey;
        } catch (e) {
          Sentry.withScope(function (scope) {
            scope.setLevel("fatal");
            Sentry.captureException(e);
          });
          console.error(e);
          notificationAdded({
            text: "Account already imported into another vault.",
            type: "error",
          });
          setImporting(null);
          return;
        }
      }

      if (_importType === "account") {
        if (alreadyImported) {
          triggerError(new Error("Already imported"));
          return;
        }
        await vault.importAccount({
          identifier,
          seed,
          commitmentReceipt,
          commitmentMapperPubKey,
          type: "ethereum",
          timestamp: Date.now(),
        });
        setLastImportedAccount({
          identifier,
          seed,
          commitmentReceipt,
          commitmentMapperPubKey,
          type: "ethereum",
          timestamp: Date.now(),
        });
      }
    }
    setImporting(null);
  };

  const importTelegram = async (telegramPayload: string) => {
    setImporting("account");
    setLastImportedAccount(null);

    let { seed, accountNumber, mnemonic } = await vault.getNextSeed(
      WalletPurpose.IMPORTED_ACCOUNT
    );

    try {
      const commitmentMapperSecret =
        CommitmentMapper.generateCommitmentMapperSecret(seed);
      const vaultSecret = await vault.getVaultSecret();

      const { commitmentReceipt, commitmentMapperPubKey, account } =
        await vault.commitmentMapper.getTelegramCommitmentReceipt(
          env.telegramBotId,
          telegramPayload,
          commitmentMapperSecret,
          vaultSecret
        );
      await vault.importAccount({
        identifier: account.identifier,
        seed,
        commitmentReceipt,
        commitmentMapperPubKey,
        type: "telegram",
        profile: {
          login: account.username,
          id: account.userId,
          name: account.firstName,
          avatar: account.photoUrl,
        },
        wallet: {
          accountNumber: accountNumber,
          mnemonic: mnemonic,
        },
        timestamp: Date.now(),
      });
    } catch (e) {
      //Check if the account is already in the vault
      if (
        e?.response?.data?.error === "Address is already used for a commitment!"
      ) {
        console.error(e);
        Sentry.withScope(function (scope) {
          scope.setLevel("fatal");
          Sentry.captureException(e);
        });
        notificationAdded({
          text: "Telegram account already imported in this vault or in another one",
          type: "error",
        });
        setImporting(null);
      } else {
        triggerError(e);
      }
      return;
    } finally {
      setImporting(null);
    }
  };

  const importGithub = async (githubCode: string) => {
    setImporting("account");
    setLastImportedAccount(null);

    let { seed, accountNumber, mnemonic } = await vault.getNextSeed(
      WalletPurpose.IMPORTED_ACCOUNT
    );
    try {
      const commitmentMapperSecret =
        CommitmentMapper.generateCommitmentMapperSecret(seed);
      const vaultSecret = await vault.getVaultSecret();

      const { commitmentReceipt, commitmentMapperPubKey, account } =
        await vault.commitmentMapper.getGithubCommitmentReceipt(
          githubCode,
          commitmentMapperSecret,
          vaultSecret
        );

      await vault.importAccount({
        identifier: account.identifier,
        seed,
        commitmentReceipt,
        commitmentMapperPubKey,
        type: "github",
        profile: {
          login: account.login,
          id: account.profileId,
          name: account.name,
          avatar: account.avatarUrl,
        },
        wallet: {
          accountNumber: accountNumber,
          mnemonic: mnemonic,
        },
        timestamp: Date.now(),
      });
    } catch (e) {
      //Check if the account is already in the vault
      if (
        e?.response?.data?.error === "Address is already used for a commitment!"
      ) {
        console.error(e);
        Sentry.withScope(function (scope) {
          scope.setLevel("fatal");
          Sentry.captureException(e);
        });
        notificationAdded({
          text: "Github account already imported in this vault or in another one",
          type: "error",
        });
        setImporting(null);
      } else {
        triggerError(e);
      }
      return;
    } finally {
      setImporting(null);
    }
  };

  const importTwitter = async (oauth: {
    oauthToken: string;
    oauthVerifier: string;
  }) => {
    setImporting("account");
    setLastImportedAccount(null);
    let { seed, accountNumber, mnemonic } = await vault.getNextSeed(
      WalletPurpose.IMPORTED_ACCOUNT
    );
    try {
      const commitmentMapperSecret =
        CommitmentMapper.generateCommitmentMapperSecret(seed);
      const vaultSecret = await vault.getVaultSecret();

      const { commitmentReceipt, commitmentMapperPubKey, account } =
        await vault.commitmentMapper.getTwitterCommitmentReceipt(
          oauth.oauthToken,
          oauth.oauthVerifier,
          commitmentMapperSecret,
          vaultSecret
        );

      await vault.importAccount({
        identifier: account.identifier,
        seed,
        commitmentReceipt,
        commitmentMapperPubKey,
        type: "twitter",
        profile: {
          login: account.username,
          id: account.userId,
          name: "",
          avatar: "",
        },
        wallet: {
          accountNumber: accountNumber,
          mnemonic: mnemonic,
        },
        timestamp: Date.now(),
      });
    } catch (e) {
      if (
        e?.response?.data?.error === "Address is already used for a commitment!"
      ) {
        console.error(e);
        Sentry.withScope(function (scope) {
          scope.setLevel("fatal");
          Sentry.captureException(e);
        });
        notificationAdded({
          text: "Twitter account already imported in this vault or in another one",
          type: "error",
        });
        setImporting(null);
      } else {
        triggerError(e);
      }
      return;
    } finally {
      setImporting(null);
    }
  };

  const importTwitterV2 = async (oauth: {
    callback: string;
    twitterCode: string;
  }) => {
    setImporting("account");
    setLastImportedAccount(null);
    let { seed, accountNumber, mnemonic } = await vault.getNextSeed(
      WalletPurpose.IMPORTED_ACCOUNT
    );
    try {
      const commitmentMapperSecret =
        CommitmentMapper.generateCommitmentMapperSecret(seed);
      const vaultSecret = await vault.getVaultSecret();
      const { commitmentReceipt, commitmentMapperPubKey, account } =
        await vault.commitmentMapper.getTwitterV2CommitmentReceipt(
          oauth.callback,
          oauth.twitterCode,
          commitmentMapperSecret,
          vaultSecret
        );

      await vault.importAccount({
        identifier: account.identifier,
        seed,
        commitmentReceipt,
        commitmentMapperPubKey,
        type: "twitter",
        profile: {
          login: account.username,
          id: account.userId,
          name: "",
          avatar: "",
        },
        wallet: {
          accountNumber: accountNumber,
          mnemonic: mnemonic,
        },
        timestamp: Date.now(),
      });
    } catch (e) {
      if (
        e?.response?.data?.error === "Address is already used for a commitment!"
      ) {
        console.error(e);
        Sentry.withScope(function (scope) {
          scope.setLevel("fatal");
          Sentry.captureException(e);
        });
        notificationAdded({
          text: "Twitter account already imported in this vault or in another one",
          type: "error",
        });
        setImporting(null);
      } else {
        triggerError(e);
      }
      return;
    } finally {
      setImporting(null);
    }
  };

  return (
    <ModalsContext.Provider
      value={{
        open,
        close,
        importing,
        lastImportedAccount,
        importTarget,
        accountTypes,
        importEthereum,
        importGithub,
        importTelegram,
        importTwitter,
        importTwitterV2,
        isOpen,
        importType,
      }}
    >
      {children}
    </ModalsContext.Provider>
  );
}
