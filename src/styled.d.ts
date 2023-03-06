// styled.d.ts
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      // no modification on targeted color
      primary: string;
      safe: string;
      background: string;
      test: string;
      success: string;
      error: string;
      warning: string;

      //no modification on purple
      purple0: string;
      purple1: string;
      purple2: string; // primary
      purple3: string;
      purple4: string;
      purple5: string;
      purple6: string;
      purple7: string;
      purple8: string;

      // no modification on green
      green0: string;
      green1: string; // test & success
      green2: string;
      green3: string;
      green4: string;
      green5: string;
      green6: string;
      green7: string;
      green8: string;

      // no modification on orange
      orange0: string;
      orange1: string;
      orange2: string; // safe & warning
      orange3: string;
      orange4: string;
      orange5: string;
      orange6: string;
      orange7: string;
      orange8: string;

      // blue design system modified
      blue0: string;
      blue1: string;
      blue2: string;
      blue3: string;
      blue4: string;
      blue5: string;
      blue6: string;
      blue7: string; // color for disabled
      blue8: string;
      blue9: string;
      blue10: string;
      blue11: string; // Sismo color & background
      blue12: string;

      // white modified
      white: string;
    };
    fonts: {
      logoRegular: string;
      logo: string;
      light: string;
      regular: string;
      medium: string;
      bold: string;
      semibold: string;
    };
  }
}
