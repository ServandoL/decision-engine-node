import {createDefaultPreset, type JestConfigWithTsJest} from 'ts-jest'

const tsJestTransformCfg = createDefaultPreset().transform;

const presetConfig = createDefaultPreset({})

const jestConfig: JestConfigWithTsJest = {
    ...presetConfig,
    testEnvironment: 'node',
    transform: {
        ...tsJestTransformCfg
    },
    preset: 'ts-jest',
    clearMocks: true,
}

export default jestConfig