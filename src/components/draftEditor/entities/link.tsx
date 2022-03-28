import * as React from 'react';
import {ContentBlock, ContentState} from 'draft-js';
import {ENTITY_TYPE_LINK} from '../util/constants';

export const findLinkEntities = (contentBlock: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) => {
    contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();

            return entityKey !== null && contentState.getEntity(entityKey).getType() === ENTITY_TYPE_LINK;
        },
        callback
    );
};

interface Props {
    contentState: ContentState;
    entityKey: string;
    children: React.ReactNode;
}

export const Link = (props: Props) => {
    const {contentState, entityKey} = props;
    const {url} = contentState.getEntity(entityKey).getData();

    return (
        <a
            className="md-link"
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            aria-label={url}
        >{props.children}</a>
    );
};
