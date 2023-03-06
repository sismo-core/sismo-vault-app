import { Link, LinkProps, useMatch, useResolvedPath } from "react-router-dom";
import styled from "styled-components";

const CustomLink = styled(Link)<{ match: number }>`
  ${(props) =>
    props.match === 1 &&
    `
        font-family: ${props.theme.fonts.semibold};
    `}
  text-decoration: none;
`;

export const InternalLink = ({ children, to, ...props }: LinkProps) => {
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });

  return (
    <div>
      <CustomLink match={match ? 1 : 0} to={to} {...props}>
        {children}
      </CustomLink>
    </div>
  );
};
