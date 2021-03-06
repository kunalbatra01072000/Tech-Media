import React, { Fragment } from 'react';

const PageNotFound = () => {
  return (
    <Fragment>
      <h1 className='x-large text-primary'>
        <i className='fas fa-exclamation-triangle'></i> Page Not Found
      </h1>
      <p className='large'>Page does not exists (404)</p>
    </Fragment>
  );
};

export default PageNotFound;
