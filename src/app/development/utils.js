import React from 'react';
import moment from 'moment';

export const defaultTableHeaders = [
  {
    field: 'applied_date',
    display: 'Date Applied',
    formatFunc: d => moment.utc(new Date(d.applied_date)).format('MMM DD, YYYY'),
  },
  {
    field: 'address',
    display: 'Address',
  },
  {
    field: 'permit_subtype',
    display: 'Type',
    show: colWidth => colWidth > 70,
    // formatFunc: d => d.permit_subtype,
  },
  {
    field: 'status_current',
    display: 'Status',
    show: colWidth => colWidth > 90,
  },
  {
    field: 'application_name',
    display: 'Project',
    show: colWidth => colWidth > 90,
  },
  {
    field: 'permit_number',
    display: 'Record Link',
    formatFunc: d => <a href={`/permits/${d.permit_number}`}>{d.permit_number}</a>,
  },
];

export const trcProjectTypes = {};
{
  // Assign colors to project types
  // const orderedColors = [
    //   '#FF3A3A',
    //   '#749B5F',
    //   '#2d93ad',
    //   '#004EA3',
    //   '#9B6681',
    //   '#9E4F55',
    //   '#073d49',
    // ];
  trcProjectTypes['Level I'] = {
    id: 'Level I',
    permit_group: 'Planning',
    permit_type: 'Development',
    permit_subtype: 'Level I',
    short: 'I',
    description: 'Projects smaller than 35,000 square feet or with fewer than 20 residential units that trigger zoning compliance requirements.',
    color: '#FF3A3A',
  };
  trcProjectTypes['Major Subdivision'] = {
    id: 'Major Subdivision',
    permit_group: 'Planning',
    permit_type: 'Subdivision',
    permit_subtype: 'Major',
    short: 'MS',
    description: 'Any project that requires the extension or creation of a new public or private street.  Typically these projects create new residential lots.',
    color: '#749B5F',
  };
  trcProjectTypes['Level II'] = {
    id: 'Level II',
    permit_group: 'Planning',
    permit_type: 'Development',
    permit_subtype: 'Level II',
    short: 'II',
    description: 'In most zoning districts, commercial projects between 35,000 and 99,9999 square feet, residential projects between 20 and 49 dwelling units and industrial projects with a floor area greater than 100,000 square feet.  Different restrictions apply in the River Zoning District or Downtown.',
    color: '#2d93ad',
  };
  trcProjectTypes['Level III'] = {
    id: 'Level III',
    permit_group: 'Planning',
    permit_type: 'Development',
    permit_subtype: 'Level III',
    short: 'III',
    description: 'Commercial projects over 100,000 square feet, residential projects over 50 dwelling units and industrial projects in the River zoning district that are over 100,000 square feet.  Different requirements apply for Downtown projects.',
    color: '#004EA3',
  };
  trcProjectTypes['Conditional Zoning'] = {
    id: 'Conditional Zoning',
    permit_group: 'Planning',
    permit_type: 'Development',
    permit_subtype: 'Conditional Zoning',
    short: 'CZ',
    description: 'Any development project that seeks to change the zoning of a site and develop the site simultaneously.',
    color: '#9B6681',
  };
  trcProjectTypes['Conditional Use Permit'] = {
    id: 'Conditional Use Permit',
    permit_group: 'Planning',
    permit_type: 'Development',
    permit_subtype: 'Conditional Use',
    short: 'CUP',
    description: <div>Anything that is listed as a conditional use in <a href="https:/library.municode.com/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTXVIUSRISUSPRECOUS_S7-16-2COUS" target="_blank" rel="noopener noreferrer">Section 7-16-2 of the Unified Development Ordinance.</a></div>,
    color: '#073d49',
  };
}
