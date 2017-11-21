import React from 'react';
import TeamComments from '../containers/TeamComments';

export default function App(props) {
  // HACK: === 'true' because it comes as a string from html. The prop is overriden
  return <TeamComments
          {...props}
          canSeePrivateComments={props.canSeePrivateComments === 'true'}
          />;
}
