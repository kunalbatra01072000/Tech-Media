import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ProfileItem = ({
  prof: {
    user: { _id, name, avatar },
    status,
    company,
    location,
    skills,
  },
}) => {
  return (
    <div className='profile bg-light'>
      <img src={avatar} alt='avatar' className='round-img' />
      <div className=''>
        <h2>{name}</h2>
        <p>
          {status} {company && <span> at {company}</span>}
        </p>
        <p className='my-1'>{location && <span>{location}</span>}</p>
        <Link to={`/profile/${_id}`} className='btn btn-primary'>
          View Profile
        </Link>
        <ul>
          {skills.slice(0, 4).map((sk, idx) => (
            <li key={idx} className='text-primary'>
              <i className='fas fa-check'></i>
              {'  '}
              {sk}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

ProfileItem.propTypes = {
  prof: PropTypes.object.isRequired,
};

export default ProfileItem;
