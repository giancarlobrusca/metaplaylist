import React from "react";
import { ethers } from "ethers";
import styles from "../styles/Home.module.scss";
import abi from "../artifacts/contracts/MetaPlaylist.sol/MetaPlaylist.json";
import { Song } from "./components/Song";
import queryString from "querystring";

const Home = ({ accessToken }) => {
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [uri, setUri] = React.useState("");
  const [error, setError] = React.useState("");
  const [showHelp, setShowHelp] = React.useState(false);
  const [showMetaMaskHelp, setShowMetaMaskHelp] = React.useState(false);
  const [mining, setMining] = React.useState(false);

  const [allSongs, setAllSongs] = React.useState([]);
  const contractAddress = "0x6fdf83eFA96E727F52DDDf2aF37c20147Fbe9385";
  const contractABI = abi.abi;

  console.log(uri);

  async function getAllSongs() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const songPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const songs = await songPortalContract.getAllSongs();

        let songsCleaned = [];
        songs.forEach((song) => {
          songsCleaned.push({
            address: song.waver,
            timestamp: new Date(song.timestamp * 1000),
            uri: song.uri,
          });
        });

        setAllSongs(songsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function checkIfWalletIsConnected() {
    setShowMetaMaskHelp(false);

    try {
      const { ethereum } = window;

      if (!ethereum) {
        setShowMetaMaskHelp(true);
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);

        getAllSongs();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function connectWallet() {
    setShowMetaMaskHelp(false);

    try {
      const { ethereum } = window;

      if (!ethereum) {
        setShowMetaMaskHelp(true);
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  }

  async function addSong() {
    setError("");

    if (uri.length < 20) {
      setError("Bad link!");
      return;
    }

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const songPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waveTxn = await songPortalContract.addSong(uri, {
          gasLimit: 300000,
        });
        setMining(true);
        setUri("");

        await waveTxn.wait();
        setMining(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  React.useEffect(() => {
    let songPortalContract;

    const onNewSong = (address, timestamp, uri) => {
      console.log("NewSong", address, timestamp, uri);

      setAllSongs((prevSongs) => [
        ...prevSongs,
        {
          address,
          timestamp: new Date(timestamp * 1000),
          uri,
        },
      ]);
    };

    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      songPortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      songPortalContract.on("NewSong", onNewSong);
    }

    return () => {
      if (songPortalContract) {
        songPortalContract.off("NewSong", onNewSong);
      }
    };
  }, [contractABI]);

  React.useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <main className={styles.mainContainer}>
      <div>
        <h1 className={styles.header}>
          Let's make a <strong>MetaPlaylist</strong> together
        </h1>
        <div className={styles.form}>
          <input
            onFocus={() => setShowHelp(true)}
            onBlur={() => {
              setShowHelp(false);
              setError("");
            }}
            type="text"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          {showHelp && (
            <>
              <p className={styles.help}>
                Please put a complete Spotify track link
              </p>
              <p style={{ color: "white", fontSize: "0.7rem" }}>
                For example:
                https://open.spotify.com/track/7I8L3vYCLThw2FDrE6LuzE?si=374812cc8f9641b3
              </p>
            </>
          )}
          {showMetaMaskHelp && (
            <>
              <p className={styles.help}>
                You need to get{" "}
                <a
                  style={{ textDecoration: "underline" }}
                  href="https://metamask.io/"
                  alt="MetaMask page"
                >
                  MetaMask
                </a>
              </p>
              <p style={{ color: "white", fontSize: "0.7rem" }}>
                It's preatty easy!
              </p>
            </>
          )}

          {!currentAccount ? (
            <button onClick={connectWallet}>Connect Wallet</button>
          ) : (
            <button onClick={addSong}>
              {mining ? "Mining..." : "Add song"}
            </button>
          )}
        </div>
      </div>
      <div>
        {allSongs.map((song, index) => (
          <Song
            key={index}
            address={song.address}
            trackLink={song.uri}
            time={song.timestamp.toString()}
            token={accessToken}
          />
        ))}
      </div>
      <footer>
        Builded by{" "}
        <a href="" alt="Giancarlo's Twitter">
          @giancarlol
        </a>
        , thanks to <a href="https://buildspace.so/">buildspace</a>
      </footer>
    </main>
  );
};

export async function getServerSideProps() {
  const clientID = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const base64Auth = Buffer.from(`${clientID}:${clientSecret}`).toString(
    "base64"
  );

  let data;

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${base64Auth}`,
      },
      body: queryString.stringify({
        grant_type: "client_credentials",
      }),
    });
    data = await response.json();
  } catch (error) {
    console.log(error);
  }

  return {
    props: {
      accessToken: data.access_token,
    },
  };
}

export default Home;
