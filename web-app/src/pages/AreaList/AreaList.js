import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Loader } from '../../components/Spinner';
import { AreaListItem } from '../../components/AreaListItem';
import { TrashpointList } from '../TrashpointList';

import {
  selectors as areaSels,
  actions as areaActs,
} from '../../reducers/areas';
import { selectors as userSels } from '../../reducers/user';
import {actions as trashpileActions} from '../../reducers/trashpile';

class AreaList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedArea: undefined,
    };
  }
  componentWillMount() {
    const {
      loading,
      areas,
      getAreas,
      getUserAreas,
      isAdmin,
      userId,
    } = this.props;

    if (!loading) {
      if (isAdmin) {
        getAreas();
      } else {
        getUserAreas({ userId });
      }
    }
  }
  handleListItemClick = area => {
    this.setState({ selectedArea: area });
    // this.props.history.push(`/areas/${area.id}/trashpoints`);
  };
  renderInnerAreaList = () => {
    const { loading, areas, error } = this.props;
    if (loading) {
      return (
        <div className="AreaList-message">
          <Loader />
        </div>
      );
    }
    if (error) {
      return (
        <div className="AreaList-message">
          An error was encountered. Please try refreshing
        </div>
      );
    }
    if (areas.length === 0) {
      return <div className="AreaList-message">You have no assigned areas</div>;
    }
    return areas.map((a, i) =>
      (<AreaListItem
        onClick={this.handleListItemClick}
        index={i}
        area={a}
        key={a.id}
      />),
    );
  };
  handleBackClick = () => {
    this.setState({ selectedArea: undefined }, () => {
      this.props.resetAreaTrashpoints();
    });
  };
  render() {
    const { selectedArea } = this.state;
    if (selectedArea) {
      return (
        <div className="AreaList">
          <div className="AreaList-top-band">
            <div
              onClick={this.handleBackClick}
              className="AreaList-top-band-back"
            >
              <div className="AreaList-top-band-left-arrow" />
            </div>
            <div className="AreaList-top-band-area">
              {selectedArea.name}
            </div>
          </div>
          <TrashpointList history={this.props.history} selectedArea={selectedArea}/>
        </div>
      );
    }
    return (
      <div className="AreaList">
        {this.renderInnerAreaList()}
      </div>
    );
  }
}
AreaList.defaultProps = {
  areas: undefined,
};
AreaList.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.any.isRequired,
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      parentId: PropTypes.string,
      leaderId: PropTypes.string,
    }),
  ),
  getAreas: PropTypes.func.isRequired,
};

const mapState = state => {
  const isAdmin = userSels.isSuperAdmin(state);
  if (isAdmin) {
    return {
      areas: areaSels.getNestedAreas(state),
      loading: areaSels.areAreasLoading(state),
      error: areaSels.hasAreasError(state),
      isAdmin,
    };
  }
  const userId = userSels.getProfile(state).id;
  return {
    areas: areaSels.getUserNestedAreas(state, userId),
    loading: areaSels.areUserAreasLoading(state, userId),
    error: areaSels.hasUserAreaError(state, userId),
    isAdmin,
    userId,
  };
};
const mapDispatch = {
  getAreas: areaActs.getAreas,
  getUserAreas: areaActs.getUserAreas,
  resetAreaTrashpoints: trashpileActions.resetAreaTrashpoints
};

export default connect(mapState, mapDispatch)(AreaList);
