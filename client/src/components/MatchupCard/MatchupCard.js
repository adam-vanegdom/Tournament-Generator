import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import checkProps from '@jam3/react-check-extra-props';

import './MatchupCard.scss';
import TeamCard from '../TeamCard/TeamCard';
import MatchupInfo from '../MatchupInfo/MatchupInfo';
import SubmitButton from '../SubmitButton/SubmitButton';
import DateSelect from '../DateSelect/DateSelect';

class MatchupCard extends React.PureComponent {
  state = {
    gameInfo: this.props.gameInfo
  };

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    this.setState({ gameInfo: this.props.gameInfo });
  }

  render() {
    return (
      <div className={classnames(`MatchupCard`, this.props.className)}>
        <DateSelect />
        <div className={classnames(`MatchupCard`, this.props.className)}>
          <div className="teamAssign">
            <h2 className="teamTag">HOME</h2>
            <TeamCard teamName={this.state.gameInfo.picks[0].homeTeam} />
          </div>
          <div className="teamAssign">
            <h2 className="teamTag">AWAY</h2>
            <TeamCard teamName={this.state.gameInfo.picks[0].awayTeam} />
          </div>
          <h2 className="teamTag">THE MATCHUP</h2>
          <div className="teamAssign">
            <MatchupInfo teamName={this.state.gameInfo.picks[0].homeTeam} />
          </div>
          <div className="teamAssign">
            <MatchupInfo teamName={this.state.gameInfo.picks[0].awayTeam} />
          </div>
          <h2 className="teamTag">swipe to view more games</h2>
          <SubmitButton />
        </div>
      </div>
    );
  }
}

MatchupCard.propTypes = checkProps({
  className: PropTypes.string
});

MatchupCard.defaultProps = {};

export default MatchupCard;
