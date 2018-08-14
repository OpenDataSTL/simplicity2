import React from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { Query } from 'react-apollo';
import moment from 'moment';
import gql from 'graphql-tag';
import LoadingAnimation from '../../shared/LoadingAnimation';
import Error from '../../shared/Error';
import PieChart from '../../shared/visualization/PieChart';
import Map from '../../shared/visualization/Map';
import { getBoundsFromStreetData, convertStreetLinesToLatLngArrays } from '../../utilities/mapUtilities';
import CrimeTable from '../crime/CrimeTable';
import EmailDownload from '../../shared/EmailDownload';
import ButtonGroup from '../../shared/ButtonGroup';
import Button from '../../shared/Button';
import { refreshLocation } from '../../utilities/generalUtilities';
import { english } from './english';
import { spanish } from './spanish';
import { withLanguage } from '../../utilities/lang/LanguageContext';

const getMarker = (type) => {
  switch (type) {
    case 'MISSING PERSON REPORT':
    case 'RUNAWAY JUVENILE':
      return require('../../shared/User.png');
    case 'DAMAGE TO PERSONAL PROPERTY':
    case 'VANDALISM':
      return require('../../shared/Hammer.png');
    case 'ASSAULT - SIMPLE':
    case 'ASSAULT ON FEMALE':
    case 'ASSAULT W/DEADLY WEAPON':
      return require('../../shared/Ambulance.png');
    case 'COMMUNICATING THREAT':
      return require('../../shared/Bubble.png');
    case 'INTIMIDATING STATE WITNESS':
    case 'PERJURY':
    case 'OBSTRUCTION OF JUSTICE':
      return require('../../shared/Library2.png');
    case 'FRAUD':
    case 'FRAUD-CREDIT CARD':
    case 'FALSE PRETENSE - OBTAIN PROPERTY BY':
    case 'IMPERSONATE':
      return require('../../shared/Profile.png');
    case 'CARRYING CONCEALED WEAPON':
      return require('../../shared/Gun.png');
    case 'RESIST, DELAY, OBSTRUCT OFFICER':
    case 'CIT INCIDENT':
    case 'DV ASSISTANCE OTHER':
    case 'VICTIM ASSISTANCE OTHER':
    case 'ASSAULT ON GOVERNMENT OFFICIAL':
      return require('../../shared/Shield3.png');
    case 'DWI':
    case 'UNAUTHORIZED USE OF MOTOR VEHICLE':
      return require('../../shared/Car.png');
    case 'LARCENY OF MV OTHER':
    case 'LARCENY OF MV AUTO':
    case 'LARCENY OF MV TRUCK':
      return require('../../shared/Car.png');
    case 'TRESPASS':
      return require('../../shared/Fence.png');
    case 'INFORMATION ONLY':
      return require('../../shared/Pencil7.png');
    case 'DRUG PARAPHERNALIA POSSESS':
    case 'DRUG OFFENSE - FELONY':
    case 'DRUG OFFENSE - MISDEMEANOR':
    case 'DRUG PARAPHERNALIA OTHER':
      return require('../../shared/AidKit2.png');     
    case 'COUNTERFEITING-BUYING/RECEIVING':
      return require('../../shared/BillDollar.png');
    case 'LARCENY ALL OTHER':
    case 'LARCENY FROM BUILDING':
    case 'LARCENY FROM MOTOR VEHICLE':
    case 'ROBBERY - COMMON LAW':
    case 'ROBBERY - ARMED - KNIFE':
      return require('../../shared/Dollar.png');
    default:
      return require('../../shared/Ellipsis.png');
  }
};

const createLegend = (crimeData) => {
  const crimeTypes = [];
  let crimeTypeAlreadyPresent;
  for (let i = 0; i < crimeData.length; i += 1) {
    crimeTypeAlreadyPresent = false;
    for (let j = 0; j < crimeTypes.length; j += 1) {
      if (crimeTypes[j] === crimeData[i].offense_long_description) {
        crimeTypeAlreadyPresent = true;
        break;
      }
    }
    if (!crimeTypeAlreadyPresent) {
      crimeTypes.push(crimeData[i].offense_long_description);
    }
  }
  return (
    <div style={{ width: '160px' }}>
      {crimeTypes.map(type => (
        <div
          key={`legendItem-${type}`}
          style={{ width: '160px', marginBottom: '5px' }}
        >
          <img
            alt="legendItem"
            src={getMarker(type)}
            style={{ display: 'inline-block', width: '25px', verticalAlign: 'top' }}
          />
          <span
            style={{ marginLeft: '5px', display: 'inline-block', width: '130px' }}
          >{type}
          </span>
        </div>
      ))}
    </div>
  );
};

const convertToPieData = (crimeData) => {
  // Group crimes to less categories?? Right now just show top 8 and Other
  let pieData = [];
  let crimeTypeAlreadyPresent;
  for (let i = 0; i < crimeData.length; i += 1) {
    crimeTypeAlreadyPresent = false;
    for (let j = 0; j < pieData.length; j += 1) {
      if (pieData[j].name === crimeData[i].offense_long_description) {
        pieData[j].value += 1;
        crimeTypeAlreadyPresent = true;
        break;
      }
    }
    if (!crimeTypeAlreadyPresent) {
      pieData.push(Object.assign(
        {},
        {},
        { name: crimeData[i].offense_long_description, value: 1 }
      ));
    }
  }

  pieData.sort((a, b) => (
    ((a.value > b.value) ? -1 : ((a.value < b.value) ? 1 : 0)) // eslint-disable-line
  ));

  let otherCount = 0;
  for (let i = 9; i < pieData.length; i += 1) {
    otherCount += pieData[i].value;
  }
  if (pieData.length > 8) {
    pieData = pieData.slice(0, 9).concat({ name: 'Other', value: otherCount });
  }

  return pieData;
};

const GET_CRIMES_BY_STREET = gql`
  query getCrimesAndStreetInfoQuery($centerline_ids: [Float], $radius: Int, $before: String, $after: String) {
    crimes_by_street (centerline_ids: $centerline_ids, radius: $radius, before: $before, after: $after) {
      case_number
      date_occurred
      address
      offense_long_description
      offense_short_description
      geo_beat
      x
      y
    }
    streets (centerline_ids: $centerline_ids) {
      centerline_id
        left_zipcode
        right_zipcode
        line {
          x
          y
        }
    }    
  }
`;

const CrimesByStreet = props => (
  <Query
    query={GET_CRIMES_BY_STREET}
    variables={{
      centerline_ids: props.location.query.id.trim().split(','),
      radius: props.radius,
      before: props.before,
      after: props.after,
    }}
  >
    {({ loading, error, data }) => {
      if (loading) return <LoadingAnimation />;
      if (error) return <Error message={error.message} />;
      // set language
      let content;
      switch (props.language.language) {
        case 'Spanish':
          content = spanish;
          break;
        default:
          content = english;
      }

      const pieData = convertToPieData(data.crimes_by_street);
      const mapData = data.crimes_by_street.map(item => (Object.assign({}, item, {
        popup: `<div><b>${item.address}</b><p>${moment.utc(item.date_occurred).format('M/DD/YYYY')}</p><p>${item.offense_long_description}</p></div>`,
        options: { icon: L.icon({
          iconUrl: getMarker(item.offense_long_description),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [2, -22],
        }) } })
      ));

      const getNewUrlParams = view => (
        {
          view,
        }
      );

      return (
        <div className="crimes-template__data">
          <div className="row">
            <div className="col-xs-12">
              <ButtonGroup alignment="right">
                <Button
                  onClick={() => refreshLocation(getNewUrlParams('map'), props.location)}
                  active={props.location.query.view === 'map'}
                  positionInGroup="left"
                >{content.map_view}
                </Button>
                <Button
                  onClick={() => refreshLocation(getNewUrlParams('list'), props.location)}
                  active={props.location.query.view === 'list'}
                  positionInGroup="middle"
                >{content.list_view}
                </Button>
                <Button
                  onClick={() => refreshLocation(getNewUrlParams('summary'), props.location)}
                  positionInGroup="right"
                  active={props.location.query.view === 'summary'}
                >{content.chart_view}
                </Button>
              </ButtonGroup>
              <div className="pull-left" style={{ marginTop: '10px', marginBottom: '15px' }}>
                <EmailDownload
                  downloadData={data.crimes_by_street}
                  fileName={content.crimes_by_street_filename}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div
              id="summaryView"
              className="col-xs-12"
              hidden={props.location.query.view !== 'summary'}
            >
              {pieData.length > 0 ?
                <PieChart data={pieData} altText={content.crime_pie_chart} />
                :
                <div className="alert alert-info">{content.no_results_found}</div>
              }
            </div>

            <div id="listView" hidden={props.location.query.view !== 'list'}>
              <CrimeTable data={data.crimes_by_street} location={props.location} />
            </div>

            <div id="mapView" className="col-xs-12" hidden={props.location.query.view !== 'map'}>
              {data.crimes_by_street.length === 0 || props.location.query.view !== 'map' ?
                <div className="alert alert-info">{content.no_results_found}</div>
                :
                <Map
                  data={mapData}
                  legend={createLegend(data.crimes_by_street)}
                  bounds={getBoundsFromStreetData(data.streets)}
                  drawStreet
                  streetData={convertStreetLinesToLatLngArrays(data.streets)}
                  zoomToPoint={(props.location.query.zoomToPoint !== undefined &&
                    props.location.query.zoomToPoint !== '') ?
                    props.location.query.zoomToPoint : null}
                />
              }
            </div>
          </div>
        </div>
      );
    }}
  </Query>
);

CrimesByStreet.propTypes = {
  location: PropTypes.object, // eslint-disable-line
  query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

CrimesByStreet.defaultProps = {
  query: { entity: 'address', label: '123 Main street' },
};

export default withLanguage(CrimesByStreet);
