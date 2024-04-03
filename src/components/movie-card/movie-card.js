import React, { Component } from 'react';
import { Tag, Card, Flex, Typography, Rate } from 'antd';
import { format } from 'date-fns';

import { MovieServiceConsumer } from '../movie-service-context';

import posterDefault from './posterDefault.png';
import './movie-card.css';
const { Text } = Typography;

export default class MovieCard extends Component {
  // Функция обрезки описания фильма
  cutText(text) {
    const ind = text.indexOf(' ', 180);
    return text.slice(0, ind) + ' ...';
  }

  render() {
    // Дестректурируем из Props переменные
    const { title, description, image, date, rate, onAddRating, movieGenreIds, myRating } = this.props;

    let realiseDate = 'no relise date';
    let colorClass;

    let poster = image.length < 36 ? posterDefault : image;

    if (rate <= 3) {
      colorClass = 'red-rate';
    } else if (rate <= 5) {
      colorClass = 'orange-rate';
    } else if (rate <= 7) {
      colorClass = 'yellow-rate';
    } else if (rate > 7) {
      colorClass = 'green-rate';
    }

    if (date) {
      realiseDate = format(new Date(date), 'MMMM dd, yyyy');
    }

    return (
      <MovieServiceConsumer>
        {(allGenresArray) => {
          let movieGenresName = [];
          console.log(allGenresArray);
          movieGenreIds.forEach((elem) => {
            allGenresArray.forEach((genre) => {
              if (genre.id === elem) {
                movieGenresName.push(genre.name);
              }
            });
          });
          let allTags = [];

          movieGenresName.forEach((genre) => {
            let tag = <Tag>{genre}</Tag>;
            allTags.push(tag);
          });

          return (
            <Card
              className="movie-card"
              hoverable
              styles={{
                body: {
                  padding: 0,
                  overflow: 'hidden',
                },
              }}
            >
              <div className="movie-card__container">
                <img className="image movie-card__image" alt="Movie poster" src={poster} />
                <div className="movie-card__info">
                  <div className="title-container">
                    <h5 className="movie-card__title">{title}</h5>
                    <div className={`movie-card__rate ${colorClass}`}>
                      <span>{rate}</span>
                    </div>
                  </div>
                  <Text type="secondary" className="movie-card__date">
                    {realiseDate}
                  </Text>
                  <Flex justify="flex-start" className="genres-container">
                    {allTags}
                  </Flex>
                  <Text className="text-description">{this.cutText(description)}</Text>
                  <Rate
                    className="movie-card__stars"
                    allowHalf
                    count={10}
                    defaultValue={myRating}
                    style={{ fontSize: 16 }}
                    onChange={(value) => onAddRating(value)}
                  />
                </div>
              </div>
            </Card>
          );
        }}
      </MovieServiceConsumer>
    );
  }
}
