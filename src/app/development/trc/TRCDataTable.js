import React from 'react';
// import PropTypes from 'prop-types';
import { timeDay, timeWeek } from 'd3-time';
import PermitsTableWrapper from '../permits/PermitsTableWrapper';
import TimeSlider from '../volume/TimeSlider';
import ErrorBoundary from '../../ErrorBoundary';
import { trcProjectTypes } from './utils';


class TRCDataTable extends React.Component {
  constructor() {
    super();
    const now = timeDay.floor(new Date());
    this.initialBrushExtent = [
      timeWeek.offset(now, -1).getTime(),
      now.getTime(),
    ];
    this.state = {
      timeSpan: this.initialBrushExtent,
    };
  }

  render() {
    return (<div className="container">
      <ErrorBoundary>
        <TimeSlider
          onBrushEnd={newExtent => this.setState({
            timeSpan: newExtent,
          })}
          defaultBrushExtent={this.initialBrushExtent}
        />
        <PermitsTableWrapper
          // Defaults are fine for now
          after={this.state.timeSpan[0]}
          before={this.state.timeSpan[1]}
          projectTypes={trcProjectTypes}
          permit_groups={['Planning']}
        />
      </ErrorBoundary>
    </div>);
  }
}

export default TRCDataTable;
