import { MethodKeysOf, MockedObject } from "jest-mock";
import BasePlatform from "../../src/BasePlatform";
/**
 * Mock Platform Peg
 * Creates a mock BasePlatform class
 * spys on PlatformPeg.get and returns mock platform
 * @returns MockPlatform instance
 */
export declare const mockPlatformPeg: (platformMocks?: Partial<Record<MethodKeysOf<BasePlatform>, unknown>>) => MockedObject<BasePlatform>;
export declare const unmockPlatformPeg: () => void;
