import React from "react";
import styles from "../../styles/Songs.module.scss";
import * as timeago from "timeago.js";

export const Song = ({ trackLink, address, time, token }) => {
  const [songData, setSongData] = React.useState(null);

  const trackID = trackLink.slice(31, 53) || "";

  React.useEffect(() => {
    fetch(`https://api.spotify.com/v1/tracks/${trackID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setSongData(data);
      })
      .catch((error) => console.error(error));
  }, [token, trackID, trackLink]);

  return (
    <div className={styles.songWrapper}>
      <aside className={styles.address}>{address}</aside>
      <article className={styles.song}>
        {songData && (
          <>
            <img src={songData.album.images[0].url} alt="album cover" />
            <ul>
              <li>{songData.name}</li>
              <li>
                <strong>{songData.artists[0].name}</strong>
              </li>
            </ul>
          </>
        )}
      </article>
      <aside className={styles.time}>{timeago.format(time, "EN-US")}</aside>
    </div>
  );
};
