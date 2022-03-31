import * as React from "react";
import "./Tooltip.module.css";

interface TooltipProps {
  left: number;
  top: number;
  text: string;
}

export class Tooltip extends React.PureComponent<TooltipProps> {
  public render() {
    return (
      <div
        className="md-tooltip md-tooltip--link"
        style={{ left: this.props.left, top: this.props.top }}
      >
        {this.props.text}
        <style jsx global>{`
          .md-tooltip {
            position: absolute;
            background: #0b3827;
            padding: 7px 10px;
            color: #fff;
            font-size: 12px;
            max-width: 700px;
            z-index: 1;
            border-radius: 2px;
          }

          .md-tooltip--link {
            word-break: break-all;
          }
        `}</style>
      </div>
    );
  }
}
