import * as React from 'react';

import {SideButtonComponentProps} from '../MediumDraftEditor';
import {UploadImageData, uploadHelper} from '../util/uploadImage';

interface ImageButtonOptions {
    uploadImage?: (files: File) => Promise<UploadImageData>;
}

interface ImageButtonComponentProps extends SideButtonComponentProps, ImageButtonOptions {
}

class ImageButton extends React.PureComponent<ImageButtonComponentProps> {

    private inputRef = React.createRef<HTMLInputElement>();
   
    public render() {
        return (
            <button
                className="md-sb-button md-sb-button--img"
                type="button"
                onClick={this.onClick}
            >
                <svg viewBox="0 0 14 14" height="14" width="14">
                    <path d="M13.9,11L13.9,11L10,7.5L7.5,10L4,5.5L0,11"/>
                    <path d="M10,5.3c0.7,0,1.2-0.6,1.2-1.2c0-0.7-0.6-1.3-1.2-1.3C9.3,2.8,8.8,3.3,8.8,4C8.8,4.7,9.3,5.3,10,5.3z"/>
                </svg>
                <input
                    type="file"
                    accept="image/*"
                    ref={this.inputRef}
                    onChange={this.onChange}
                    className="md-sb-button-file-input"
                />
            </button>
        );
    }

    public onClick = () => {
        this.inputRef.current.value = null;
        this.inputRef.current.click();
    }

    private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: File[] = [];

        for (let i = 0; i < e.target.files.length; i++) {
            if (e.target.files[i].type.indexOf('image/') === 0) {
                files.push(e.target.files[i]);
            }
        }

        if (files.length) {
            uploadHelper(this.props, files, {uploadImage: this.props.uploadImage});
        }

        this.props.close();
    }
}

export function getImageButton(options: ImageButtonOptions): React.FunctionComponent<SideButtonComponentProps> {
    return (props: SideButtonComponentProps) => (
        <ImageButton
            {...props}
            uploadImage={options.uploadImage}
        />
    );
}
