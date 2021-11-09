const main = async () => {
  const songContractFactory = await hre.ethers.getContractFactory(
    "MetaPlaylist"
  );
  const songContract = await songContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.001"),
  });

  await songContract.deployed();

  console.log("SongContract address: ", songContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
