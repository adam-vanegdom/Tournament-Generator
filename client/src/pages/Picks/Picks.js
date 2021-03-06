import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import wait from '@jam3/wait';
import checkProps from '@jam3/react-check-extra-props';
import { Redirect } from 'react-router-dom';
import swal from 'sweetalert';
import './Picks.scss';
import axios from 'axios';
import Transition from '../PagesTransitionWrapper';
import animate from '../../util/gsap-animate';
import MatchupCard from '../../components/MatchupCard/MatchupCard';
import Arrow from '../../components/Arrow/Arrow';
import LoadScreen from '../../components/LoadScreen/LoadScreen';

class Picks extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: true,
      alreadyPicked: false,
      authCode: '',
      access_token: '',
      response: 0,
      date: '',
      picks: [],
      stats: [],
      currentPickIndex: 0,
      avatar: ''
    };
  }

  componentDidMount() {
    this.checkAuth();
    var date = new Date();
    var lastDate = new Date();
    lastDate.setDate(date.getDate() - 1);
    console.log(lastDate.getDate());
    var today = [pad(date.getFullYear(), 4), pad(date.getMonth() + 1, 2), pad(date.getDate(), 2)];
    var yesterday = [pad(lastDate.getFullYear(), 4), pad(lastDate.getMonth() + 1, 2), pad(lastDate.getDate(), 2)];
    console.log(today, yesterday);
    var startdate = today.join('-');
    var enddate = yesterday.join('-');
    // var startdate = '2019-02-13';
    // var enddate = '2019-02-12';

    // Make a request for a user with a given date
    axios
      .get('/games', {
        params: {
          product: startdate
        }
      })
      .then(res => {
        if (res.data === 'no games today') {
          this.setState({ response: -1 });
        } else {
          const teams = res.data.data;
          teams.map(game => {
            this.setState({
              date: startdate,
              picks: [
                ...this.state.picks,
                {
                  gameId: game.id,
                  homeTeam: game.home_team.full_name,
                  homeTeamId: game.home_team.id,
                  awayTeam: game.visitor_team.full_name,
                  awayTeamId: game.visitor_team.id,
                  selection: ''
                }
              ]
            });
            return 0;
          });

          teams.map(game => {
            axios
              .get('/data', { params: { team_id: game.home_team.id, date: enddate } })
              .then(res => {
                console.log(res);
                if (res.data !== 'no current games') {
                  this.setState({
                    stats: [
                      ...this.state.stats,
                      {
                        teamId: game.home_team.id,
                        playerStats: res.data
                      }
                    ]
                  });
                }
              })
              .catch(err => console.log('idealy do something with the .catch error here'));

            axios
              .get('/data', { params: { team_id: game.visitor_team.id, date: enddate } })
              .then(res => {
                if (res.data !== 'no current games') {
                  this.setState({
                    stats: [
                      ...this.state.stats,
                      {
                        teamId: game.visitor_team.id,
                        playerStats: res.data
                      }
                    ]
                  });
                }
                this.setState({ response: 1 });
              })
              .catch(err => console.log(err));
            return 0;
          });
        }
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });

    animate.set(this.container, { autoAlpha: 0 });
    // let code = window.location.href;
  }

  componentWillUnmount() {}

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

  prevPick = () => {
    const lastIndex = this.state.picks.length - 1;

    const resetIndex = this.state.currentPickIndex === 0;
    const index = resetIndex ? lastIndex : this.state.currentPickIndex - 1;

    this.setState({
      currentPickIndex: index
    });
  };

  nextPick = () => {
    const lastIndex = this.state.picks.length - 1;

    const resetIndex = this.state.currentPickIndex === lastIndex;
    const index = resetIndex ? 0 : this.state.currentPickIndex + 1;

    this.setState({
      currentPickIndex: index
    });
  };

  checkAuth = () => {
    if (!localStorage.getItem('token')) {
      console.log('Token not found: logging in..');
      let url = window.location.href;
      let spliturl = url.split('?');
      let code = '';
      if (spliturl[1]) {
        code = spliturl[1].substring(5, spliturl[1].length - 7);
      } else {
        code = '';
      }
      this.setState({ authCode: code });

      axios
        .get(
          'https://slack.com/api/oauth.access?client_id=2222937506.634323100293&client_secret=526319ccf98aac5aa4f81a31a8e4a4fd&code=' +
            code +
            '&scope=identify.avatar'
        )
        .then(res => {
          if (res.data.error) {
            console.log(res.data.error);
            this.setState({ loggedIn: false });
          } else {
            this.setState({ access_token: res.data.access_token });
            localStorage.setItem('token', res.data.access_token);
            axios.get('https://slack.com/api/users.identity?token=' + localStorage.getItem('token')).then(res => {
              this.setState({
                user: {
                  email: res.data.user.email,
                  id: res.data.user.id,
                  name: res.data.user.name,
                  avatar: res.data.user.image_1024
                }
              });
              localStorage.setItem('user', this.state.user.name);
              this.updateUserAvatar();
            });
          }
        })
        .catch(err => {
          console.log(err);
          this.setState({ loggedIn: false });
        });
    } else {
      this.setState({ access_token: localStorage.getItem('token') });
      axios
        .get('https://slack.com/api/users.identity?token=' + localStorage.getItem('token') + '&scope=identify.avatar')
        .then(res => {
          this.setState({
            user: {
              email: res.data.user.email,
              id: res.data.user.id,
              name: res.data.user.name,
              avatar: res.data.user.image_1024
            }
          });
          localStorage.setItem('user', this.state.user.name);
          this.updateUserAvatar();
        })
        .catch(() => {
          this.setState({ loggedIn: false });
        });
    }
  };

  updateUserAvatar = () => {
    axios
      .get('/login', {
        params: {
          name: this.state.user.name,
          avatar: this.state.user.avatar
        }
      })
      .then(res => {
        console.log('added user avatar');
      })
      .catch(err => {
        console.log('unable to add avatar for some reason, hmm');
      });
  };

  onCastVoteEvent = team => {
    this.setState(prevState => ({
      picks: prevState.picks.map((pick, index) => {
        return index === this.state.currentPickIndex ? Object.assign(pick, { selection: team }) : pick;
      })
    }));
  };

  onSubmitPicksEvent = () => {
    axios
      .get('/checkIfAlreadyPickedToday', { params: { name: this.state.user.name, date: this.state.date } })
      .then(response => {
        if (response.data === 'found') {
          swal('You already Voted!', '', 'error');
          this.setState({ alreadyPicked: true });
          console.log('Pick invalid already picked');
        } else {
          swal('Pick Submited!', 'Check back after the game to see how you did!', 'success');
          axios.post('/logPicks', {
            logPicks: this.state
          });
        }
      });
    this.setState({ alreadyPicked: true });
  };

  onKeyPress = event => {
    if (event.keyCode === 37) {
      this.prevPick();
    } else if (event.keyCode === 39) {
      this.nextPick();
    }
  };

  goToSlide = index => {
    console.log('index');
    this.setState({
      currentPickIndex: index
    });
  };

  render() {
    if (this.state.loggedIn) {
      if (this.state.alreadyPicked) {
        return <Redirect to="/results" />;
      }
      if (this.state.access_token && this.state.response) {
        if (this.state.picks.length > 1) {
          return (
            <section
              className={classnames('Picks', this.props.className)}
              ref={el => (this.container = el)}
              onKeyDown={this.onKeyPress}
              tabIndex="0"
            >
              <Arrow className="left" onClick={this.prevPick} />
              <MatchupCard
                onVote={this.onCastVoteEvent}
                onSubmit={this.onSubmitPicksEvent}
                gameInfo={this.state}
                goToSlide={this.goToSlide}
              />
              <Arrow className="right" onClick={this.nextPick} />
            </section>
          );
        } else {
          return (
            <section
              className={classnames('Picks', this.props.className)}
              ref={el => (this.container = el)}
              onKeyDown={this.onKeyPress}
            >
              <MatchupCard
                gameInfo={this.state}
                onVote={this.onCastVoteEvent}
                onSubmit={this.onSubmitPicksEvent}
                goToSlide={this.goToSlide}
              />
            </section>
          );
        }
      } else {
        return <LoadScreen />;
      }
    } else {
      return <Redirect to="/login" />;
    }
  }
}

function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
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
