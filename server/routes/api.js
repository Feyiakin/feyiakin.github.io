const express = require('express');
const router = express.Router();

const authenticateUser = require('../middleware/authentication');

const {
  getAllAnimes,
  getSingleAnime,
  getSeasonAnime,
  searchAnime,
  addToWatchlist,
  removeFromWatchlist,
  removeFromWatched,
  getWatchlist,
  addToWatched,
  getWatched
} = require('../controllers/api');

router.get('/animes', getAllAnimes);
router.get('/anime/:id', getSingleAnime);
router.get('/animes/season/:id', getSeasonAnime);
router.get('/animes/search/:id', searchAnime);
router.post('/add-to-watchlist', authenticateUser, addToWatchlist);
router.post('/remove-from-watchlist', authenticateUser, removeFromWatchlist);
router.get('/watchlist/:id', getWatchlist);
// Make these 'post' router delete instead of post.
router.post('/add-to-watched', authenticateUser, addToWatched);
router.post('/remove-from-watched', authenticateUser, removeFromWatched);
//
router.get('/watched/:id', getWatched);

module.exports = router;
