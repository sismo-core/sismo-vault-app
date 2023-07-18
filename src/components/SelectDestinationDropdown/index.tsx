import styled from "styled-components";
import { CaretDown, Check, Plus } from "phosphor-react";
import Button from "../Button";
import { useVault } from "../../hooks/vault";
import { useImportAccount } from "../../pages/Modals/ImportAccount/provider";
import { getMainMinified } from "../../utils/getMain";
import Loader from "../Loader";
import Avatar from "../Avatar";
import colors from "../../theme/colors";
import { useState, useEffect, useRef, useMemo } from "react";
import useOnClickOutside from "../../utils/useClickOutside";
import { ImportedAccount } from "../../libs/vault-client";

const Container = styled.div<{ isSuccess: boolean }>`
  position: relative;

  display: flex;
  align-items: center;
  gap: 10px;
  color: ${(props) => props.theme.colors.blue0};

  background-color: ${(props) => (props.isSuccess ? "transparent" : props.theme.colors.blue9)};
  border-radius: 5px;
  padding: 5px 10px;

  width: 190px;

  cursor: ${(props) => (props.isSuccess ? "default" : "pointer")};

  box-sizing: border-box;
  user-select: none;
`;

const PlaceholderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-grow: 1;
`;

const PlaceholderImg = styled.div`
  width: 22.8px;
  height: 22.8px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.blue0};
`;

const PlaceholderTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  color: ${(props) => props.theme.colors.blue0};
  font-family: ${(props) => props.theme.fonts.medium};
`;

const PlaceholderSub1 = styled.div`
  font-size: 14px;
  line-height: 20px;
`;

const PlaceholderSub2 = styled.div<{ isSelected: boolean }>`
  margin-top: -5px;
  font-size: 12px;
  line-height: 18px;

  color: ${(props) => (props.isSelected ? props.theme.colors.green1 : props.theme.colors.blue0)};
`;

const DropdownContainer = styled.div<{
  dropdownOpen: boolean;
  dropdownUp: boolean;
}>`
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;

  width: 190px;
  background-color: ${(props) => props.theme.colors.blue9};
  padding: 5px;

  left: 0px;
  ${(props) =>
    props.dropdownUp
      ? "bottom: 36px; border-top-left-radius: 5px; border-top-right-radius: 5px;"
      : "top: 39px;  border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;"};
  box-sizing: border-box;

  z-index: 3;

  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;

  visibility: ${(props) => (props.dropdownOpen ? "visible" : "hidden")};
`;

const DestinationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AccountLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px;
`;

const AvatarWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 22.8px;
  height: 22.8px;
`;

const LoaderWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 22.8px;
  height: 22.8px;
`;

const AccountName = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  line-height: 20px;
`;

const AccountImporting = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  line-height: 20px;
  font-style: italic;
`;

const CaretWrapper = styled.div<{ dropdownOpen: boolean }>`
  transform: ${(props) => (props.dropdownOpen ? "rotate(180deg)" : "rotate(0deg)")};
`;

const ButtonInner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

type Props = {
  selectedDestination: ImportedAccount | null;
  setSelectedDestination: React.Dispatch<React.SetStateAction<ImportedAccount | null>>;
  isSuccess: boolean;
};

export default function SelectDestinationDropdown({
  selectedDestination,
  setSelectedDestination,
  isSuccess,
}: Props): JSX.Element {
  const vault = useVault();
  const importAccount = useImportAccount();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownUp, setDropdownUp] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const onToggleClick = () => {
    if (isSuccess) return;
    setDropdownOpen(!dropdownOpen);
  };

  const ref = useRef(null);

  useOnClickOutside(ref, () => !importAccount.isOpen && setDropdownOpen(false));

  const onDestinationClick = (destination: ImportedAccount) => {
    setSelectedDestination(destination);
    setDropdownOpen(false);
  };

  const filteredDestinations = useMemo(() => {
    return vault.importedAccounts?.filter(
      (destination) =>
        destination?.identifier !== selectedDestination?.identifier &&
        destination.type === "ethereum"
    );
  }, [vault.importedAccounts, selectedDestination]);

  useEffect(() => {
    if (ref.current.offsetTop > windowHeight / 2) {
      setDropdownUp(true);
    } else {
      setDropdownUp(false);
    }
  }, [windowHeight, dropdownOpen]);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // useEffect(() => {
  //   if (importAccount.lastImportedAccount) {
  //     setSelectedDestination(importAccount.lastImportedAccount);
  //     setDropdownOpen(false);
  //   }
  // }, [importAccount.lastImportedAccount, setSelectedDestination]);

  return (
    <Container ref={ref} isSuccess={isSuccess}>
      <PlaceholderContainer onClick={onToggleClick}>
        {selectedDestination ? (
          <AvatarWrapper>
            <Avatar
              account={selectedDestination}
              style={{ width: "100%", height: "100%" }}
              width={22.8}
            />
          </AvatarWrapper>
        ) : (
          <PlaceholderImg />
        )}
        <PlaceholderTextGroup>
          <PlaceholderSub1>
            {selectedDestination ? getMainMinified(selectedDestination) : "Select"}
          </PlaceholderSub1>
          <PlaceholderSub2 isSelected={selectedDestination ? true : false}>
            Destination account
          </PlaceholderSub2>
        </PlaceholderTextGroup>

        {isSuccess ? (
          <Check size={10.74} weight="bold" color={colors.green1} />
        ) : (
          <CaretWrapper dropdownOpen={dropdownOpen}>
            <CaretDown size={10.74} weight="bold" color={colors.blue0} />
          </CaretWrapper>
        )}
      </PlaceholderContainer>

      <DropdownContainer dropdownOpen={dropdownOpen} dropdownUp={dropdownUp}>
        <DestinationList>
          {filteredDestinations?.map((destination, index) => (
            <AccountLine
              key={destination.identifier + index}
              onClick={() => onDestinationClick(destination)}
            >
              <AvatarWrapper>
                <Avatar
                  account={destination}
                  style={{ width: "100%", height: "100%" }}
                  width={22.8}
                />
              </AvatarWrapper>

              <AccountName>{getMainMinified(destination)}</AccountName>
            </AccountLine>
          ))}
          {importAccount.importing === "account" && (
            <AccountLine style={{ order: dropdownUp ? -1 : 0 }}>
              <LoaderWrapper>
                <Loader size={16} />
              </LoaderWrapper>
              <AccountImporting>Importing...</AccountImporting>
            </AccountLine>
          )}
        </DestinationList>

        <Button
          small
          isMedium
          onClick={() =>
            importAccount.open({
              importType: "account",
            })
          }
          style={{
            width: "100%",
            backgroundColor: colors.blue6,
            order: dropdownUp ? -1 : 0,
          }}
        >
          <ButtonInner>
            <Plus size={10.48} weight="bold" />
            Import account
          </ButtonInner>
        </Button>
      </DropdownContainer>
    </Container>
  );
}
