const truncateAddress = (address) => {
  const part1 = address.slice(0, 6);
  const part2 = address.slice(-4);
  return `${part1}…${part2}`;
};

const longerTruncateAddress = (address) => {
  const part1 = address.slice(0, 10);
  const part2 = address.slice(-6);
  return `${part1}…${part2}`;
};

export {
  truncateAddress,
  longerTruncateAddress
};