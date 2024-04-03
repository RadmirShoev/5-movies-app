import React, { Component } from 'react';
import './search.css';
import { Input } from 'antd';

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchRequest: '',
    };
  }

  componentDidMount() {
    this.inputRef.focus();
  }

  /* Функция ввода текста в input */
  onSearchRequestChange = (event) => {
    this.setState({
      searchRequest: event.target.value, // записываем в state
    });
    this.props.onMovieSearch(event.target.value);
  };

  /* Функция отправки формы */
  onSubmit = (event) => {
    event.preventDefault();
    const { searchRequest } = this.state;

    if (searchRequest) {
      this.props.onMovieSearch(searchRequest);
      this.setState({ searchRequest: '' });
    }
  };

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <Input
          className="search-input"
          value={this.state.label}
          placeholder=" Введите фильм, например Resident Evil"
          onChange={this.onSearchRequestChange}
          ref={(inputRef) => {
            this.inputRef = inputRef;
          }}
        />
      </form>
    );
  }
}
