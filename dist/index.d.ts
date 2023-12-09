import React from 'react';
import { StoreLocatorMap, StoreLocatorOptions } from '@gocrisp/store-locator';
import '@gocrisp/store-locator/dist/store-locator.css';
export declare type StoreLocatorProps = Omit<StoreLocatorOptions, 'container'> & {
    className?: string;
    style?: React.CSSProperties;
    onMapInit?: (storeLocatorMap: StoreLocatorMap) => void;
};
export { StoreLocatorMap } from '@gocrisp/store-locator';
export declare const StoreLocator: React.VFC<StoreLocatorProps>;
