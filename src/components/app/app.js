import React, { Component } from 'react';
import { Spin, Alert, Pagination, Tabs } from 'antd';
import { debounce } from 'lodash';

import './app.css';
import MovieService from '../../services/movie-service';
import MoviesList from '../movies-list/movies-list';
import Search from '../search/search';
import { MovieServiceProvider } from '../movie-service-context';

export default class App extends Component {
  errorText = `Ошибка загрузки данных с сервера. Включите VPN и обновите страницу`;
  infoText = `Фильма с таким названием не найдено`;
  movie = new MovieService();
  genresArray = [];
  myRatedMoviesMap = new Map();

  constructor() {
    super();
    this.state = {
      movieData: [1],
      loading: true,
      error: false,
      totalResults: 0,
      searchRequest: '',
      rated: false,
      tabItems: [
        {
          key: '1',
          label: 'Search',
        },
        {
          key: '2',
          label: 'Rated',
        },
      ],
    };
  }

  //Функция для обработки ошибок
  onError = (err) => {
    this.setState({
      error: true,
      loading: false,
    });
  };
  //Получение списка фильмов Search
  updateMovie(searchText, page) {
    if (searchText) {
      this.setState({
        loading: true, //Загрузка началась
      });

      this.movie
        .getResource(searchText, page)
        .then((response) => {
          const films = response.results;
          const newArr = [];

          //Создаем масссив с укороченной инфой о фильмах
          films.forEach((film) => {
            const filmIfo = {
              title: film.title,
              description: film.overview,
              image: `https://image.tmdb.org/t/p/w500${film['poster_path']}`,
              date: film['release_date'],
              id: film.id,
              movieGenreIds: film['genre_ids'],
              rate: film['vote_average'].toFixed(1),
              myRating: this.myRatedMoviesMap.get(film.id) ? this.myRatedMoviesMap.get(film.id) : 0,
            };

            newArr.push(filmIfo);
          });

          this.setState(() => {
            return {
              movieData: newArr,
              loading: false,
              totalResults: response['total_results'],
            };
          });
        })
        .catch(this.onError);
    }
  }

  //получаем ключ гостевой сессии
  guestSession() {
    if (!this.sessionId) {
      this.movie
        .createGuestSession()
        .then((response) => {
          this.sessionId = response['guest_session_id'];
        })
        .catch(this.onError);
    }
  }

  componentDidMount() {
    this.guestSession();
    this.updateMovie('Кунгфу панда');

    this.movie.getGenres().then((res) => {
      this.allGenresArray = res.genres;
    });
  }

  //Переключение вкладок Serch и Rated
  ratedChange = () => {
    if (!this.state.rated) {
      this.setState((state) => {
        return {
          rated: !state.rated,
          movieData: [],
        };
      });
      this.movie
        .getRatedMovies(this.sessionId)
        .then((response) => {
          const films = response.results;
          const newArr = [];
          console.log(films);
          //Создаем масссив с укороченной инфой о фильмах
          films.forEach((film) => {
            const filmIfo = {
              title: film.title,
              description: film.overview,
              image: `https://image.tmdb.org/t/p/w500${film['poster_path']}`,
              date: film['release_date'],
              id: film.id,
              movieGenreIds: film['genre_ids'],
              rate: film['vote_average'].toFixed(1),
              myRating: film.rating,
            };

            newArr.push(filmIfo);
          });
          this.setState(() => {
            return {
              movieData: newArr,
              loading: false,
              totalResults: response['total_results'],
            };
          });
        })
        .catch(this.onError);
    } else {
      this.setState((state) => {
        return {
          rated: !state.rated,
          movieData: [1],
          loading: true,
          error: false,
          totalResults: 0,
          searchRequest: '',
        };
      });
    }
  };

  onAddRating = (id, rate) => {
    // Добавляем оценку в Мар для синхронизации
    this.myRatedMoviesMap.set(id, rate);
    // Отправляем новый рейтинг на сервер
    this.movie.addRating(id, rate, this.sessionId);
  };

  render() {
    const { movieData, error, loading, totalResults, searchRequest, rated } = this.state; // массив с фильмами
    let errorMessage = null;
    let spiner = null;
    let searchInput = (
      <Search
        onMovieSearch={debounce((searchRequest) => {
          this.updateMovie(searchRequest);
          this.setState({ searchRequest: searchRequest });
        }, 600)}
      />
    );

    if (error) {
      // Если ошибка сети
      errorMessage = <Alert message={this.errorText} type="error" showIcon className="app-alert" />;
    }
    if (movieData.length === 0) {
      // Не найдено
      errorMessage = <Alert message={this.infoText} type="warning" showIcon className="app-alert" />;
      //нет оцененных фильмов
      if (rated) {
        errorMessage = <Alert message={'Нет оцененных фильмов'} type="warning" showIcon className="app-alert" />;
      }
    }
    // Режим оцененных фильмов, спрячь строку поиска
    if (rated) {
      searchInput = null;
    }

    if (loading) {
      spiner = (
        <React.Fragment>
          <Alert message={'Поиск фильма'} type="info" showIcon className="app-alert" />
          <Spin className="loading-spin" />
        </React.Fragment>
      );
      if (searchRequest === '') {
        spiner = <Alert message={'Введите свой запрос'} type="info" showIcon className="app-alert" />;
      }
    }
    //const spiner = loading ? <Spin className="loading-spin" /> : null;
    const movies = !loading && movieData ? <MoviesList films={movieData} onAddRating={this.onAddRating} /> : null;

    return (
      <div className="app-container">
        <MovieServiceProvider value={this.allGenresArray}>
          <Tabs
            defaultActiveKey="1"
            items={this.state.tabItems}
            onChange={this.ratedChange}
            className="tabs-container"
            size="large"
          />
          {searchInput}
          {errorMessage}
          {spiner}
          {movies}
          <Pagination
            className="app-pagination"
            defaultCurrent={1}
            total={totalResults}
            pageSize={20}
            onChange={(page) => {
              this.updateMovie(searchRequest, page);
            }}
          />
        </MovieServiceProvider>
      </div>
    );
  }
}
