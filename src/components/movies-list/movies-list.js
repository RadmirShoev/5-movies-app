import React from 'react';

import MovieCard from '../movie-card/movie-card';
import './movies-list.css';

function MoviesList({ films, onAddRating }) {
  const elements = films.map((elem) => {
    const { id, ...itemProps } = elem; // дестриктурируем id, ...itemProps

    return <MovieCard {...itemProps} key={id} onAddRating={(rate) => onAddRating(id, rate)} />;
  });

  return <ul className="movie-list">{elements}</ul>;
}

export default MoviesList;
