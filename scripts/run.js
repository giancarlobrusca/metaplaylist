const main = async () => {
  const songContractFactory = await hre.ethers.getContractFactory(
    "MetaPlaylist"
  );
  const songContract = await songContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await songContract.deployed();
  console.log("Contract addy:", songContract.address);

  // Get contract balance
  let contractBalance = await hre.ethers.provider.getBalance(
    songContract.address
  );
  console.log(
    `Contract balance: ${hre.ethers.utils.formatEther(contractBalance)}`
  );

  // Add song
  const waveTxn = await songContract.addSong("songUri");
  await waveTxn.wait();

  contractBalance = await hre.ethers.provider.getBalance(songContract.address);
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  let allSongs = await songContract.getAllSongs();
  console.log(allSongs);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
