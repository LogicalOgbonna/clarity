import * as React from 'react';
import {createRoot} from 'react-dom/client';

import Popup from './Popup';

const root = createRoot(document.getElementById('popup-root') as HTMLElement);

root.render(<Popup />);
