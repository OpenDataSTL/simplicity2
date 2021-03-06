import React from 'react';
import ReactDOM from 'react-dom';
import { color } from 'd3-color';
import PermitTypeCard from './PermitTypeCard';

class TypePuck extends React.Component {
  constructor() {
    super();

    this.state = {
      tooltipOpen: false,
      tooltipX: 0,
      tooltipY: 0,
    }

    this.onHover = this.onHover.bind(this);

  }

  onHover(e) {
    let tooltipX = e.pageX + 30;
    let tooltipY = e.pageY + 30;
    if ((window.innerWidth - e.pageX - 300) <= 0) {
      tooltipX -= 360;
    }
    if ((window.innerHeight - e.pageY - 300) <= 0) {
      tooltipY -= 200;
    }

    this.setState({
      tooltipOpen: true,
      tooltipX,
      tooltipY,
    })
  }

  render() {
    return (
      <div
        style={{ display: 'inline-block' }}
        onMouseEnter={this.props.hover ?
          this.onHover : null
        }
        onFocus={this.props.hover ? this.onHover : null}
        onMouseLeave={this.props.hover ? e => this.setState({ tooltipOpen: false }) : null}
      >
        <svg
          height={this.props.size}
          width={this.props.size}
        >
          <circle
            r={this.props.size / 2}
            cx={this.props.size / 2}
            cy={this.props.size / 2}
            style={{
              fill: this.state.tooltipOpen ?
                color(this.props.typeObject.color).darker(1)
                : this.props.typeObject.color,
              stroke: 'white',
              strokeWidth: '2px',
            }}
          />
          <text
            x={this.props.size / 2}
            y={this.props.size / 2}
            style={{
              stroke: 'white',
              strokeWidth: this.state.tooltipOpen ? 2 : 1,
              textAnchor: 'middle',
              alignmentBaseline: 'middle',
              letterSpacing: '0.15em',
              fontSize: 16 * (this.props.size / 50),
            }}
          >
            {this.props.typeObject.short}
          </text>
        </svg>
        {this.props.hover && this.state.tooltipOpen &&
          ReactDOM.createPortal(
            (<div
              className="puck-tooltip"
              style={{
                position: 'absolute',
                top: this.state.tooltipY,
                left: this.state.tooltipX,
                zIndex: 99,
                maxWidth: '300px',
              }}
            >
              <PermitTypeCard type={this.props.typeObject.id} />
            </div>),
            document.body
          )
        }
      </div>
    )
  }
}

TypePuck.defaultProps = {
  size: 50,
  hover: true,
}

export default TypePuck;
