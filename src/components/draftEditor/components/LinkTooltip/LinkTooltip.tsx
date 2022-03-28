import * as React from "react";
import { Tooltip } from "../Tooltip/Tooltip";
import { KEY_CTRL } from "../../util/constants";

interface LinkTooltipProps {
  editorRef: React.RefObject<HTMLElement>;
  onTooltipShow: () => void;
  onTooltipHide: () => void;
}

interface LinkTooltipState {
  isLinkTooltipOpen: boolean;
  linkTooltipTop: number;
  linkTooltipLeft: number;
  linkTooltipUrl: string;
}

export class LinkTooltip extends React.PureComponent<
  LinkTooltipProps,
  LinkTooltipState
> {
  public readonly state = {
    isLinkTooltipOpen: false,
    linkTooltipTop: 0,
    linkTooltipLeft: 0,
    linkTooltipUrl: "",
  };

  private mouseX: number = 0;
  private mouseY: number = 0;
  private removeMoveListener: () => void;

  public componentDidMount(): void {
    const editorRef = this.props.editorRef.current;

    if (editorRef) {
      editorRef.addEventListener("mousemove", this.onMouseMove, {
        passive: true,
      });

      this.removeMoveListener = () => {
        editorRef.removeEventListener("mousemove", this.onMouseMove);
      };
    }

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("click", this.onClick);
  }

  public componentWillUnmount(): void {
    if (this.removeMoveListener) {
      this.removeMoveListener();
    }

    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("click", this.onClick);
  }

  public render() {
    const {
      isLinkTooltipOpen,
      linkTooltipLeft,
      linkTooltipTop,
      linkTooltipUrl,
    } = this.state;

    return (
      isLinkTooltipOpen && (
        <Tooltip
          left={linkTooltipLeft}
          top={linkTooltipTop}
          text={linkTooltipUrl}
        />
      )
    );
  }

  private onMouseMove = (event: MouseEvent) => {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    if (this.state.isLinkTooltipOpen) {
      this.checkMousePosition();
    }
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.keyCode === KEY_CTRL && !this.state.isLinkTooltipOpen) {
      this.checkMousePosition();
    }
  };

  private onKeyUp = (event: KeyboardEvent) => {
    if (event.keyCode === KEY_CTRL) {
      this.hideLinkTooltip();
    }
  };

  private onClick = () => {
    if (this.state.isLinkTooltipOpen && this.state.linkTooltipUrl) {
      const otherWindow = window.open(this.state.linkTooltipUrl, "_blank");
      // https://mathiasbynens.github.io/rel-noopener/
      otherWindow.opener = null;
      otherWindow.location.href = this.state.linkTooltipUrl;
    }
  };

  private checkMousePosition() {
    const linkClassName = "md-link";
    const rootClassName = "md-root";
    let element = document.elementFromPoint(this.mouseX, this.mouseY);
    let linkElement: HTMLAnchorElement | null = null;
    let rootElement: HTMLElement | null = null;

    do {
      if (element) {
        if (element.classList.contains(linkClassName)) {
          linkElement = element as HTMLAnchorElement;
        }

        if (element.classList.contains(rootClassName)) {
          rootElement = element as HTMLElement;
        }

        element = element.parentElement;
      }
    } while (element && !(linkElement && rootElement));

    if (rootElement && linkElement) {
      this.showLinkTooltip(rootElement, linkElement);
    } else {
      this.hideLinkTooltip();
    }
  }

  private hideLinkTooltip() {
    this.setState({
      isLinkTooltipOpen: false,
    });

    this.props.onTooltipHide();
  }

  private showLinkTooltip(root: HTMLElement, element: HTMLAnchorElement) {
    const elementBounds = element.getBoundingClientRect();
    const rootBounds = root.getBoundingClientRect();
    const MIN_TOOLTIP_WIDTH = 300;

    if (elementBounds && rootBounds) {
      let left = elementBounds.left - rootBounds.left;
      if (rootBounds.right - elementBounds.left < MIN_TOOLTIP_WIDTH) {
        left = rootBounds.right - rootBounds.left - MIN_TOOLTIP_WIDTH;
      }

      this.setState({
        isLinkTooltipOpen: true,
        linkTooltipTop: elementBounds.bottom - rootBounds.top,
        linkTooltipLeft: left,
        linkTooltipUrl: element.href,
      });

      this.props.onTooltipShow();
    }
  }
}
