import React from 'react';
import WallComments from '../containers/WallComments';

export default function App(props) {
  // HACK: === 'true' because it comes as a string from html. The prop is overriden
  return <WallComments
          {...props}
          canSeeComments={props.canSeeComments === 'true'}
          />;
}
