import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import LoadingAnimation from '../../../shared/LoadingAnimation';
import Map from '../../../shared/visualization/Map';

// Make query based on URL, render sub components depending on query results

const GET_PERMIT = gql`
  query getPermitsQuery($permit_numbers: [String]) {
    permits(permit_numbers: $permit_numbers) {
      permit_number
      permit_description
      permit_group
      permit_type
      permit_subtype
      permit_category
      applicant_name
      applied_date
      status_current
      status_date
      created_by
      building_value
      job_value
      total_project_valuation
      total_sq_feet
      fees
      paid
      balance
      invoiced_fee_total
      address
      x
      y
      contractor_names
      internal_record_id
      custom_fields {
        type
        name
        value
      }
      comments {
        comment_seq_number
        comment_date
        comments
      }
    }
  }
`;

const Permit = (props) => (
  <Query
    query={GET_PERMIT}
    variables={{
      permit_numbers: [props.routeParams.id],
    }}
  >
    {({ loading, error, data }) => {
      if (loading) return <LoadingAnimation />;
      if (error || data.permits.length === 0) {
        console.log(error);
        return <div>Error :( </div>;
      }
      if (data.permits.length > 1) {
        console.log('This is not quite right: ', data)
      }

      const thisPermit = data.permits[0];
      const specialFields = [
        'permit_description',
        'custom_fields',
        'x',
        'y',
      ];

      const permitWithCustomFields = Object.assign({}, thisPermit)

      thisPermit.custom_fields.forEach(customField =>
        permitWithCustomFields[customField.name] = customField.value)

      permitWithCustomFields.contractor_names = Object.values(thisPermit.contractor_names)
        .join(', ');

      const mapData = [Object.assign(
        {},
        thisPermit,
        {
          popup: `<b>${thisPermit.address}</b>`
        },
      )];

      return (<div className="container">
        <h1 className="title__text">{thisPermit.permit_description}</h1>
        <div className="row">
          <dl className="dl-horizontal">
            {Object.keys(permitWithCustomFields)
              .filter(d => specialFields.indexOf(d) === -1 && +permitWithCustomFields[d] !== 0)
              .map(d => (<div className="col-sm-12 col-md-6" key={d}>
                <dt
                  className="text-left text-capitalize"
                >
                  {d.split('_').join(' ')}:
                </dt>
                <dd className="text-right">{typeof permitWithCustomFields[d] !== 'object' ?
                  permitWithCustomFields[d] :
                  Object.keys(permitWithCustomFields[d]).map(k => `${k}: ${permitWithCustomFields[d][k]}`)}</dd>
              </div>))
            }
          </dl>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="map-container" style={{ height: '300px' }}>
              <Map
                data={mapData}
                center={[thisPermit.y, thisPermit.x]}
                height="100%"
                width="100%"
              />
            </div>
          </div>
        </div>
      </div>);
    }}
  </Query>
);

export default Permit;
