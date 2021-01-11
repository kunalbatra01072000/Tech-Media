import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getProfiles } from '../../actions/profile';
import Spinner from '../layout/Spinner';
import ProfileItem from './ProfileItem';

const Profiles = ({ getProfiles, profiles, loading }) => {
  useEffect(() => {
    getProfiles();
  }, [getProfiles]);
  return (
    <Fragment>
      {loading ? (
        <Spinner />
      ) : (
        <Fragment>
          <h1 className='large text-primary'>Developers</h1>
          <p className='lead'>
            <i className='fab fa-connectdevelop'></i>
            {'  '}
            Browse and connect with developers
          </p>
          <div className='profiles'>
            {profiles.length > 0 ? (
              profiles.map((prof) => <ProfileItem key={prof._id} prof={prof} />)
            ) : (
              <h1>No Profiles found...</h1>
            )}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

Profiles.propTypes = {
  getProfiles: PropTypes.func.isRequired,
  profiles: PropTypes.array,
  loading: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  loading: state.profile.loading,
  profiles: state.profile.profiles,
});

export default connect(mapStateToProps, { getProfiles })(Profiles);
