type Props = {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function BadgeLogo({ size, color, className, style }: Props): JSX.Element {
  return (
    <svg
      width={size}
      height={(10 / 9) * size}
      viewBox="0 0 9 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M4.92316 9.35663L8.70323 6.49253C8.82622 6.39932 8.91776 6.2679 8.96475 6.1171C9.01173 5.9663 9.01175 5.80387 8.9648 5.65306L7.52091 1.01921C7.47401 0.868331 7.38248 0.736822 7.25947 0.643545C7.13646 0.550268 6.98828 0.500017 6.83619 0.5H2.16427C2.0121 0.499917 1.86382 0.550122 1.74071 0.643405C1.61761 0.736689 1.52602 0.868254 1.47909 1.01921L0.0352024 5.65306C-0.011751 5.80387 -0.0117337 5.9663 0.0352518 6.1171C0.0822374 6.2679 0.17378 6.39932 0.296768 6.49253L4.07684 9.35663C4.19984 9.44981 4.34797 9.5 4.5 9.5C4.65203 9.5 4.80016 9.44981 4.92316 9.35663Z"
        fill={color}
      />
    </svg>
  );
}
