import 'styled-components';
import type { DefaultTheme as OriginalDefaultTheme } from 'styled-components';
import { COLORS } from './components/sudoku/theme';
import type { calculateSizes } from './components/sudoku/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends OriginalDefaultTheme {
    colors: typeof COLORS;
    sizes: typeof calculateSizes;
  }
}
