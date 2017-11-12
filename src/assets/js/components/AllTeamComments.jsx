import React from 'react';
import TeamComments from '../containers/TeamComments';

function displayPrivateComments(props){
  if (props.showPrivateComments === 'true') { // HACK: prop comes as string
    // NOTE: if can the user can see the private comments, then can also make private comments
    return (
      <TeamComments
        canComment={true}
        isPublic={false}
        {...props}
      />
    );
  }
}

export default function AllTeamComments(props) {
  // HACK: canPublicComment === 'true' because props come as strings
  return (
    <div>
      {displayPrivateComments(props)}
      <TeamComments
        canComment={props.canPublicComment === 'true'}
        isPublic={true}
        {...props}
      />
    </div>
  );
}
