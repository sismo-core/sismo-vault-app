type Props = {
  size: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function SismoConnectGem({ size, color, className, style }: Props): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M8.0001 15L15.3698 9.65246M8.0001 15L0.630371 9.65246M8.0001 15L13.2289 9.3435M8.0001 15L2.81344 9.3435M15.3698 9.65246L12.5547 1M15.3698 9.65246L13.2289 9.3435M12.5547 1H3.44553M12.5547 1L13.2289 9.3435M3.44553 1L0.630371 9.65246M3.44553 1L13.2289 9.3435M3.44553 1L2.81344 9.3435M0.630371 9.65246L2.81344 9.3435"
        stroke={color}
        strokeWidth="0.5"
        strokeMiterlimit="10"
      />
    </svg>
  );
}
