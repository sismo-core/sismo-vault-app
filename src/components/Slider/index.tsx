import styled from "styled-components";

const Container = styled.div`
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const SliderContainer = styled.div<{ page: number; width: number }>`
  display: flex;
  position: absolute;
  transition: all 0.6s;
  margin-top: 10px;
  ${(props) =>
    props.page === 1 &&
    `
        transform: translate3d(0, 0, 0);
    `}
  ${(props) =>
    props.page === 2 &&
    `
        transform: translate3d(-${props.width}px, 0, 0);
    `}
`;

const Content = styled.div<{ isTransparent: boolean; width: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${(props) => props.width}px;
  ${(props) =>
    props.isTransparent &&
    `
        transition: all 0.3s;
        opacity: 0
    `}
  ${(props) =>
    !props.isTransparent &&
    `
        transition: all 0.6s;
        opacity: 1
    `}
`;

const Step = styled.div<{ isOn: boolean }>`
  height: 7px;
  width: 7px;
  border-radius: 7px;
  background-color: #6771a9;
  cursor: pointer;
  ${(props) =>
    props.isOn &&
    `
        background-color: #D0D7FB;
    `}
`;

const Stepper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
`;

type SliderProps = {
  width: number;
  page: number;
  onSelectPage: (page: number) => void;
  pages: React.ReactNode[];
};

export default function Slider({
  width,
  pages,
  page,
  onSelectPage,
}: SliderProps): JSX.Element {
  return (
    <Container>
      <SliderContainer page={page} width={width}>
        {pages &&
          pages.map((_page, index) => {
            return (
              <Content
                key={index + "page"}
                isTransparent={page === index}
                width={width}
              >
                {_page}
              </Content>
            );
          })}
      </SliderContainer>
      <Stepper>
        <Step
          isOn={page === 1}
          style={{ marginRight: 10 }}
          onClick={() => onSelectPage(1)}
        />
        <Step isOn={page === 2} onClick={() => onSelectPage(2)} />
      </Stepper>
    </Container>
  );
}
