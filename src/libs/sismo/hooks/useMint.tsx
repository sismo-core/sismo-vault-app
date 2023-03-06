import { useState } from "react";
import { useSismo } from "..";
import { EligibleBadge, Proof, ProofRequest } from "../../sismo-client";
import { ImportedAccount } from "../../vault-client";
import { useVault } from "../../vault";
import * as Sentry from "@sentry/react";
import { Attestation } from "../../sismo-client/attestation-registry/types";

type HookMint = {
  proofs: Proof[];
  attestations: Attestation[];
  generatingProof: boolean;
  generatingAttestation: boolean;
  waitingNode: boolean;
  loading: boolean;
  proofError: string;
  attestationError: string;
  isSuccess: boolean;
  mintBadges: (
    eligibleBadges: EligibleBadge[],
    destination: ImportedAccount,
    chainId: number,
    onSuccess?: () => void
  ) => void;
  clearState: () => void;
};

export const useMint = (): HookMint => {
  const sismo = useSismo();
  const vault = useVault();
  const [proofs, setProofs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attestations, setAttestations] = useState(null);
  const [proofError, setProofError] = useState<string>(null);
  const [attestationError, setAttestationError] = useState(null);

  const [isSuccess, setIsSuccess] = useState(null);
  const [generatingAttestation, setGeneratingAttestation] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [waitingNode, setWaitingNode] = useState(false);

  const requests: ProofRequest[] = [];

  function clearState() {
    setProofs(null);
    setAttestations(null);
    setGeneratingProof(false);
    setGeneratingAttestation(false);
    setProofError(null);
    setAttestationError(null);
    setIsSuccess(null);
  }

  function mintBadges(
    eligibleBadges: EligibleBadge[],
    destination: ImportedAccount,
    chainId: number,
    onSuccess?: () => void
  ) {
    clearState();
    if (!eligibleBadges) return;
    if (!destination) return;

    setGeneratingProof(true);
    setLoading(true);
    for (const eligibleBadge of eligibleBadges) {
      const source = vault.importedAccounts.find(
        (_source) => _source.identifier === eligibleBadge.source.identifier
      );

      const request: ProofRequest = {
        sources: [source],
        destination: destination,
        collectionId: eligibleBadge.badge.collectionId,
        value: eligibleBadge.value,
        chainId: chainId,
      };
      requests.push(request);
    }

    sismo
      .generateProofs(requests)
      .then((proofs) => {
        setProofs(proofs);
        setGeneratingAttestation(true);
        setGeneratingProof(false);
        sismo.onBadgeMinted(chainId, (badgeMinted) => {
          if (
            badgeMinted.badge.collectionId === requests[0].collectionId &&
            requests[0].destination.identifier === badgeMinted.owner.identifier
          ) {
            setWaitingNode(false);
            setLoading(false);
            setIsSuccess(true);
            onSuccess && onSuccess();
          }
        });
        sismo
          .generateAttestations(proofs)
          .then((attestations) => {
            setWaitingNode(true);
            setGeneratingAttestation(false);
            setAttestations(attestations);
          })
          .catch((e) => {
            console.log(e);
            console.error("MINTING ERROR: ", e);
            setAttestationError("Relayer error");
            setGeneratingAttestation(false);
            setLoading(false);
            Sentry.captureException(e);
          });
      })
      .catch((e) => {
        console.error("PROOF GENERATION ERROR: ", e);
        setProofError("Proof generation error");
        setGeneratingProof(false);
        setLoading(false);
        setGeneratingAttestation(false);
        Sentry.captureException(e);
      });
  }

  return {
    proofs,
    attestations,
    generatingProof,
    generatingAttestation,
    waitingNode,
    loading,
    proofError,
    attestationError,
    isSuccess,
    mintBadges,
    clearState,
  };
};
