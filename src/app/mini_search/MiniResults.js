import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import { accessibility } from 'accessible-react-table';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import SearchResultGroup from '../search/searchResults/SearchResultGroup';
import LoadingAnimation from '../../shared/LoadingAnimation';
import Error from '../../shared/Error';
import InCityMessage from '../InCityMessage';
import {
  formatSearchResults,
  getEntities,
  getEntitiesToSearch,
  getIcon,
  getLink,
  getPlural,
  searchQuery,
} from '../search/searchResults/searchResultsUtils';
import * as poweredByGoogle from '../search/searchResults/powered_by_google_on_white.png';


const AccessibleReactTable = accessibility(ReactTable);

const dataColumns = (formattedData) => {
  return [{
    headerStyle: { boxShadow: 'none' },
    Header: <h2 className="pull-left">
      {getIcon(formattedData.label)}
      {getPlural(formattedData.label)}
      <span className="offscreen">Number of results</span>
      <span className="badge">{formattedData.results.length}</span>
      {formattedData.label === 'place' &&
        <img src={poweredByGoogle} alt="Powered by Google" style={{ marginLeft: '20px' }}></img>
      }
    </h2>,
    accessor: 'label',
    Cell: (row) => {
      console.log(row)
      return (
        <span className="search-results-group__row-inner">
          <div
            style={{
              width: '100%',
              margin: '0.25em 1em',
            }}
            // key={index}
          >
            <div
              className='text-primary'
              style={{ display: 'inline-block', minWidth: '40%' }}
            >
              <a
                href={getLink(
                  result.type,
                  result.id,
                  props.searchText,
                  props.selectedEntities,
                  result.label,
                  props.originalSearch,
                )}
                target='_blank'
                rel='noopener noreferrer'
                >
                {result.label}
              </a>
            </div>
            { result.is_in_city !== null &&
              <div
                style={{ display: 'inline-block', fontSize: '0.85em'}}
              >
                <InCityMessage
                  inTheCity={result.is_in_city}
                  text={(inOutBool) => inOutBool ? "In the city" : "Outside of the city"}
                  icon={false}
                />
              </div>
          </div>
        </span>
      );
    },
  }];
};

const MiniResults = (props) => {
  if (props.data === undefined) {
    return null;
  }
  if (props.data.loading) {
    return <LoadingAnimation message="Searching..." />;
  }
  if (props.data.error) {
    return <Error message={props.data.error.message} />;
  }

  const formattedResults = formatSearchResults(props.data.search);

  console.log(formattedResults)

  if (formattedResults.length > 0) {
    return (
      <div className="row">
        <div className="col-sm-12">
          {formattedResults.map((resultGroup, index) => (
            <div
              className="search-results-group"
              key={[resultGroup.label, index].join('_')}
            >
              <AccessibleReactTable
                ariaLabel="Search Results"
                data={resultGroup.results}
                columns={dataColumns(resultGroup)}
                showPagination={resultGroup.results.length > 5}
                defaultPageSize={resultGroup.results.length < 5 ? resultGroup.results.length : 5}
                filterable={false}
                sortable={false}
              />
            </div>
          ))}
        </div>
      </div>
    );
  } else if (formattedResults.length === 0) {
    return (<div className='alert alert-warning alert-sm'>
      No results found.  Is this an address in Asheville, NC?
    </div>);
  }
  return null;
};

const resultsShape = {
  label: PropTypes.string,
  type: PropTypes.string,
  results: PropTypes.array,
};

MiniResults.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape(resultsShape)),
  searchText: PropTypes.string,
  searchEntities: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, type: PropTypes.string, check: PropTypes.bool })),
};

export default graphql(searchQuery, {
  skip: ownProps => (!ownProps.searchText || ownProps.searchText.trim().length < 4),
  options: ownProps => ({
    variables: {
      searchString: ownProps.searchText.trim(),
      searchContexts: getEntitiesToSearch(ownProps.location.query.entities !== undefined ?
        getEntities(ownProps.location.query.entities) :
        getEntities('address,property,neighborhood,street,owner,google'))
    }
  }),
})(MiniResults);
