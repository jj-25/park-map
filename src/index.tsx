/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, {
  useEffect,
  useRef,
  ReactElement,
  useState,
  ReactNode,
} from "react";
import ReactDOM from "react-dom/client";
import { Loader, LoaderOptions } from "@googlemaps/js-api-loader";

import "./App.css";

export enum Status {
  LOADING = "LOADING",
  FAILURE = "FAILURE",
  SUCCESS = "SUCCESS",
}

/**
 * The `WrapperProps` interface extends the `LoaderOptions` interface from
 * [@googlemaps/js-api-loader](https://npmjs.com/package/@googlemaps/js-api-loader).
 * See the reference documentation for
 * [LoaderOptions](https://googlemaps.github.io/js-api-loader/interfaces/LoaderOptions.html)
 * for a complete list of all props that are available.
 */
export interface WrapperProps extends LoaderOptions {
  /**
   * Children wrapped by the `<Wrapper>{elements}</Wrapper`.
   */
  children?: ReactNode;
  /**
   * Render prop used to switch on the status.
   */
  render?: (status: Status) => ReactElement;
  /**
   * Callback prop used to access `@googlemaps/js-api-loader` and `Status`.
   *
   * Note: The callback be executed multiple times in the lifecycle of the component.
   */
  callback?: (status: Status, loader: Loader) => void;
}

/**
 * A component to wrap the loading of the Google Maps JavaScript API.
 *
 * ```
 * import { Wrapper } from '@googlemaps/react-wrapper';
 *
 * const MyApp = () => (
 * 	<Wrapper apiKey={'YOUR_API_KEY'}>
 * 		<MyMapComponent />
 * 	</Wrapper>
 * );
 * ```
 *
 * @param props
 */
export const Wrapper = ({
  children,
  render,
  callback,
  ...options
}: WrapperProps): ReactElement => {
  const [status, setStatus] = useState(Status.LOADING);

  useEffect(() => {
    const loader = new Loader(options);

    const setStatusAndExecuteCallback = (status: Status) => {
      if (callback) callback(status, loader);
      setStatus(status);
    };

    setStatusAndExecuteCallback(Status.LOADING);

    loader.load().then(
      () => setStatusAndExecuteCallback(Status.SUCCESS),
      () => setStatusAndExecuteCallback(Status.FAILURE)
    );
  }, []);

  if (status === Status.SUCCESS && children) return <>{children}</>;

  if (render) return render(status);

  return <></>;
};

///////////////////////////

const render = (status: Status): ReactElement => {
  if (status === Status.LOADING) return <h3>{status} ..</h3>;
  if (status === Status.FAILURE) return <h3>{status} ...</h3>;
  return <></>;
};

function MyMapComponent({
  center,
  zoom,
}: {
  center: google.maps.LatLngLiteral;
  zoom: number;
}) {
  const ref = useRef<any>();

  useEffect(() => {
    new window.google.maps.Map(ref.current, {
      center,
      zoom,
    });
  }, []);

  return <div ref={ref} id="map" />;
}

function App() {
  const center = { lat: -34.397, lng: 150.644 };
  const zoom = 4;

  return (
    <Wrapper apiKey="AIzaSyCRc9i650nCiqgUZUW7JERvXUq0g7lpCM8" render={render}>
      <MyMapComponent center={center} zoom={zoom} />
    </Wrapper>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
