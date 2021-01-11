import React from 'react';
import PropTypes from 'prop-types';

const ProfileTop = ({
  profile: {
    status,
    company,
    location,
    website,
    social,
    user: { name, avatar },
  },
}) => {
  return (
    <div className='profile-top bg-primary p-2'>
      <img className='round-img my-1' src={avatar} alt='avatar' />
      <h1 className='large'>{name}</h1>
      <p className='lead'>{status}</p>
      <p>{company && <span>at {company}</span>}</p>
      <p>{location && <span>{location}</span>}</p>

      <div className='icons my-1'>
        {website && (
          <a href={website} target='_blank' rel='noreferrer'>
            <i className='fas fa-globe fa-2x'></i>
          </a>
        )}

        {social && social[0].twitter && (
          <a href={social[0].twitter} target='_blank' rel='noopener noreferrer'>
            <i className='fab fa-twitter fa-2x'></i>
          </a>
        )}
        {social && social[0].facebook && (
          <a
            href={social[0].facebook}
            target='_blank'
            rel='noopener noreferrer'
          >
            <i className='fab fa-facebook fa-2x'></i>
          </a>
        )}
        {social && social[0].linkedin && (
          <a
            href={social[0].linkedin}
            target='_blank'
            rel='noopener noreferrer'
          >
            <i className='fab fa-linkedin fa-2x'></i>
          </a>
        )}
        {social && social[0].youtube && (
          <a href={social[0].youtube} target='_blank' rel='noopener noreferrer'>
            <i className='fab fa-youtube fa-2x'></i>
          </a>
        )}
        {social && social[0].instagram && (
          <a
            href={social[0].instagram}
            target='_blank'
            rel='noopener noreferrer'
          >
            <i className='fab fa-instagram fa-2x'></i>
          </a>
        )}
      </div>
    </div>
  );
};

ProfileTop.propTypes = {
  profile: PropTypes.object.isRequired,
};

export default ProfileTop;
