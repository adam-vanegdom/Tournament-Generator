import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
// import { BaseLink } from '@jam3/react-ui';
import wait from '@jam3/wait';
import checkProps from '@jam3/react-check-extra-props';

import './Picks.scss';
import { gamesApi } from '../../api/gamesApi.js';
import Transition from '../PagesTransitionWrapper';
import animate from '../../util/gsap-animate';
import MatchupCard from '../../components/MatchupCard/MatchupCard';
import Arrow from '../../components/Arrow/Arrow';

class Picks extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      response: 0,
      date: '',
      picks: []
    };
  }

  componentDidMount() {
    let startdate = '2019-05-14';
    let enddate = '2019-05-15';

    gamesApi(startdate, enddate).then(res => {
      const teams = res.data.data;
      teams.map(game => {
        this.setState({
          date: startdate,
          picks: [
            ...this.state.picks,
            { gameId: game.id, homeTeam: game.home_team.city, awayTeam: game.visitor_team.city, selection: '' }
          ]
        });
      });
      this.setState({ response: 1 });
    });

    animate.set(this.container, { autoAlpha: 0 });
    // let code = window.location.href;
  }
  onAppear = () => {
    this.animateIn();
  };

  onEnter = async prevSectionExitDuration => {
    await wait(prevSectionExitDuration); // you need to remove this if you want to perform simultaneous transition
    this.animateIn();
  };

  onLeave = () => {
    this.animateOut();
  };

  animateIn = () => {
    animate.to(this.container, 0.3, { autoAlpha: 1 });
  };

  animateOut = () => {
    // Note that the total duration should match `exit` duration for the page inside `data/pages-transitions`
    animate.to(this.container, 0.3, { autoAlpha: 0 });
  };

  render() {
    console.log(this.state);
    return (
      <section className={classnames('Picks', this.props.className)} ref={el => (this.container = el)}>
        <Arrow className="left" />
        <MatchupCard gameInfo={this.state} />
        <Arrow className="right" />
      </section>
    );
  }
}

Picks.propTypes = checkProps({
  className: PropTypes.string,
  transitionState: PropTypes.string.isRequired,
  previousRoute: PropTypes.string
});

Picks.defaultProps = {};

const mapStateToProps = state => ({
  previousRoute: state.previousRoute
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Transition(Picks));
