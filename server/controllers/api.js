const res = require('express/lib/response');
const { StatusCodes } = require('http-status-codes');
const connectDB = require('../db/connect');

const getAllAnimes = async (req, res) => {
  // Access the provided 'page' and 'limt' query parameters
  let page = req.query.page ? req.query.page : 1;
  const itemsPerPage = 9;
  let offset = (page - 1) * itemsPerPage;
  let limit = req.query.limit ? req.query.limit : 9;

  // Find all animes
  connectDB.query(
    `SELECT * FROM anime LIMIT ${offset}, ${limit}`,
    (err, result) => {
      // If there are no animes
      if (err) {
        console.log(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: 'Something went wrong. Try again' });
      } else if (result.length < 1) {
        // If no anime is found
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ msg: 'Anime not found' });
      } else {
        // If anime is found
        res.status(StatusCodes.OK).json(result);
      }
    }
  );
};

const getSingleAnime = async (req, res) => {
  // Get the anime ID
  const { id } = req.params;

  // Find the anime
  connectDB.query(
    'SELECT * FROM anime WHERE anime_url = ?',
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: 'Something went wrong. Try again' });
      } else if (result.length < 1) {
        // If no anime is found
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ msg: 'Anime not found' });
      } else {
        // If anime is found
        res.status(StatusCodes.OK).json(result[0]);
      }
    }
  );
};

const getSeasonAnime = async (req, res) => {
  // The ID will be the season
  const { id } = req.params;

  // Find the anime
  connectDB.query(
    'SELECT * FROM charts WHERE season = ?',
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: 'Something went wrong. Try again' });
      } else if (result.length < 1) {
        // if nothing is found
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: 'Anime not found' });
      } else {
        // If anime is found
        res.status(StatusCodes.OK).json(result);
      }
    }
  );
};

const searchAnime = async (req, res) => {
  const { id } = req.params;

  // Find the anime
  connectDB.query(
    'SELECT * FROM anime WHERE anime_title LIKE ?',
    ['%' + id + '%'],
    (err, result) => {
      if (err) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: 'Something went wrong. Try again' });
      } else if (result.length < 1) {
        // if nothing is found
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ msg: 'Anime not found' });
      } else {
        // If anime is found
        res.status(StatusCodes.OK).json(result);
      }
    }
  );
};

const addToWatchlist = async (req, res) => {
  const { username, anime_title, anime_url, anime_img } = req.body;
  // Check if user has the anime already added to the watchlist
  connectDB.query(
    'SELECT * FROM user_watch_list WHERE username = ? AND anime_title = ?',
    [username, anime_title],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: 'Something went wrong. Try again' });
      } else if (result.length < 1) {
        // if nothing is found, add it to the watchlist
        const watchlistItem = {
          username,
          anime_title,
          anime_url,
          anime_img,
        };
        // Insert item to DB
        connectDB.query(
          'INSERT INTO user_watch_list SET ?',
          [watchlistItem],
          (err, result) => {
            if (err) {
              return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: 'Something went wrong. Try again later' });
            }
            return res
              .status(StatusCodes.OK)
              .json({ msg: 'Anime added to watchlist' });
          }
        );
      } else {
        // If anime is found
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: 'Anime already added to watchlist' });
      }
    }
  );
};

const removeFromWatchlist = async (req, res) => {
  const { username, anime_url } = req.body;
  // Check if user has the anime already added to the watchlist
  connectDB.query(
    'SELECT * FROM user_watch_list WHERE username = ? AND anime_url = ?',
    [username, anime_url],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: 'Something went wrong. Try again' });
      } else if (result.length < 1) {
        // if nothing is found
        console.log('anime is not in watchlist');
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: 'anime not in watchlist' });
      } else {
        // If anime is found, remove it from watchlist
        connectDB.query(
          'DELETE FROM user_watch_list WHERE username = ? AND anime_url = ?',
          [username, anime_url],
          (err, result) => {
            if (err) {
              return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: 'Something went wrong. Try again' });
            } else {
              // Once deleted, send the new watchlist
              connectDB.query(
                'SELECT * FROM user_watch_list WHERE username = ?',
                [username],
                (err, newWatchlist) => {
                  if (err) {
                    return res
                      .status(StatusCodes.INTERNAL_SERVER_ERROR)
                      .json({ msg: 'Something went wrong. Try again' });
                  } else {
                    return res.status(StatusCodes.OK).json(newWatchlist);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

const removeFromWatched = async (req, res) => {
  const { username, anime_url } = req.body;
  // Check if user has the anime already added to the watchlist
  connectDB.query(
    'SELECT * FROM user_watched WHERE username = ? AND anime_url = ?',
    [username, anime_url],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: 'Something went wrong. Try again' });
      } else if (result.length < 1) {
        // if nothing is found
        console.log('anime is not in watchlist');
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: 'anime not in watchlist' });
      } else {
        // If anime is found, remove it from watchlist
        connectDB.query(
          'DELETE FROM user_watched WHERE username = ? AND anime_url = ?',
          [username, anime_url],
          (err, result) => {
            if (err) {
              return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: 'Something went wrong. Try again' });
            } else {
              // Once deleted, send the new watchlist
              connectDB.query(
                'SELECT * FROM user_watched WHERE username = ?',
                [username],
                (err, newWatched) => {
                  if (err) {
                    return res
                      .status(StatusCodes.INTERNAL_SERVER_ERROR)
                      .json({ msg: 'Something went wrong. Try again' });
                  } else {
                    return res.status(StatusCodes.OK).json(newWatched);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

const addToWatched = async (req, res) => {
  const { username, anime_url } = req.body;
  // Check if user has the anime already marked as watched
  connectDB.query(
    'SELECT * FROM user_watched WHERE username = ? AND anime_url = ?',
    [username, anime_url],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: 'Something went wrong. Try again' });
      } else if (result.length < 1) {
        // if nothing is found, add it to the watchlist
        const watchedItem = {
          username,
          anime_url,
        };
        // Insert item to DB
        connectDB.query(
          'INSERT INTO user_watched SET ?',
          [watchedItem],
          (err, result) => {
            if (err) {
              return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: 'Something went wrong. Try again later' });
            }
            return res
              .status(StatusCodes.OK)
              .json({ msg: 'Anime marked as watched' });
          }
        );
      } else {
        // If anime is found
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: 'Anime already marked as watched' });
      }
    }
  );
};

const getWatchlist = async (req, res) => {
  const { id } = req.params;

  connectDB.query(
    'SELECT * FROM user_watch_list WHERE username = ?',
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: 'Something went wrong. Try again' });
      } else if (result.length < 1) {
        // if nothing is found
        return res.status(StatusCodes.OK).json([]);
      } else {
        // If anime is found
        return res.status(StatusCodes.OK).json(result);
      }
    }
  );
};

const getWatched = async (req, res) => {
  const { id } = req.params;

  connectDB.query(
    'SELECT * FROM user_watched WHERE username = ?',
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: 'Something went wrong. Try again' });
      } else if (result.length < 1) {
        // if nothing is found
        return res
          .status(StatusCodes.OK)
          .json({ msg: 'No animes watched yet' });
      } else {
        // If anime is found
        return res.status(StatusCodes.OK).json(result);
      }
    }
  );
};

module.exports = {
  getAllAnimes,
  getSingleAnime,
  getSeasonAnime,
  searchAnime,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  addToWatched,
  removeFromWatched,
  getWatched,
};
