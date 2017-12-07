import RWR from 'react-webpack-rails';
RWR.run();

import PhotosWrapper from './components/photos-wrapper';
RWR.registerComponent('PhotosWrapper', PhotosWrapper);
