import * as React from 'react';
import {EditorBlock} from 'draft-js';
import {BlockProps} from '../../typings';
import './BlockQuoteCaption.module.css';

export const QuoteCaptionBlock = (props: BlockProps) => (
    <cite>
        <EditorBlock {...props} />
    </cite>
);
