/*
 * React.js Starter Kit
 * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

import './App.less';

import React from 'react';
import invariant from 'react/lib/invariant';
import AppActions from '../../actions/AppActions';
import AppStore from '../../stores/AppStore';
import Navbar from '../Navbar';
import ContentPage from '../ContentPage';
import NotFoundPage from '../NotFoundPage';

export default class App extends React.Component {

  componentDidMount() {
    window.addEventListener('popstate', this.handlePopState);
    window.addEventListener('click', this.handleClick);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('click', this.handleClick);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.path !== nextProps.path;
  }

  render() {
    var page = AppStore.getPage(this.props.path);
    invariant(page !== undefined, 'Failed to load page content.');
    this.props.onSetTitle(page.title);

    if (page.type === 'notfound') {
      this.props.onPageNotFound();
      return React.createElement(NotFoundPage, page);
    }

    return (
      <div className="App">
        <Navbar />
        {
          this.props.path === '/' ?
          <div className="jumbotron">
            <div className="container text-center">
              <h1>Senior frontend developer - trying to be a javascript ninja</h1>
            </div>
          </div> :
          <div className="container">
            <h2>{page.title}</h2>
          </div>
        }
        <ContentPage className="container" {...page} />
        <div className="navbar-footer">
          <div className="container">
            <p className="text-muted">
              <span>updated on April 12, 2015</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  handlePopState(event) {
    AppActions.navigateTo(window.location.pathname, {replace: !!event.state});
  }

  handleClick(event) {
    if (event.button === 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.defaultPrevented) {
      return;
    }

    // Ensure link
    var el = event.target;
    while (el && el.nodeName !== 'A') {
      el = el.parentNode;
    }
    if (!el || el.nodeName !== 'A') {
      return;
    }

    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.getAttribute('download') || el.getAttribute('rel') === 'external') {
      return;
    }

    // Ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (el.pathname === location.pathname && (el.hash || link === '#')) {
      return;
    }

    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) {
      return;
    }

    // Check target
    if (el.target) {
      return;
    }

    // X-origin
    var origin = window.location.protocol + '//' + window.location.hostname +
      (window.location.port ? ':' + window.location.port : '');
    if (!(el.href && el.href.indexOf(origin) === 0)) {
      return;
    }

    // Rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    event.preventDefault();
    AppActions.loadPage(path, () => {
      AppActions.navigateTo(path);
    });
  }

}

App.propTypes = {
  path: React.PropTypes.string.isRequired,
  onSetTitle: React.PropTypes.func.isRequired,
  onSetMeta: React.PropTypes.func.isRequired,
  onPageNotFound: React.PropTypes.func.isRequired
};
