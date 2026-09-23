import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  // =========================================================
  // PDF ASSETS
  // =========================================================
  //
  // Put the files here:
  //
  // public/
  //   pdf/
  //     header.png
  //     watermark.png
  //
  // =========================================================

  private readonly HEADER_PATH =
    '/pdf/header.png';

  private readonly WATERMARK_PATH =
    '/pdf/watermark.png';


  // =========================================================
  // LOAD IMAGE
  // =========================================================

  private async loadImage(
    path: string
  ): Promise<string | null> {

    try {

      const url =
        new URL(
          path,
          window.location.origin
        ).href;


      console.log(
        '[PDF] Loading image:',
        url
      );


      const response =
        await fetch(
          url,
          {
            method: 'GET',
            cache: 'no-cache'
          }
        );


      console.log(
        '[PDF] HTTP status:',
        response.status,
        response.statusText
      );


      if (!response.ok) {

        console.error(
          `[PDF] Image HTTP error ${response.status}:`,
          url
        );

        return null;
      }


      const blob =
        await response.blob();


      console.log(
        '[PDF] Image loaded:',
        url,
        'size:',
        blob.size,
        'type:',
        blob.type
      );


      if (
        blob.size === 0
      ) {

        console.error(
          '[PDF] Image is empty:',
          url
        );

        return null;
      }


      return await new Promise<string | null>(
        (resolve) => {

          const reader =
            new FileReader();


          reader.onload = () => {

            if (
              typeof reader.result === 'string'
            ) {

              resolve(
                reader.result
              );

            } else {

              console.error(
                '[PDF] Could not convert image to Base64:',
                url
              );

              resolve(null);
            }
          };


          reader.onerror = () => {

            console.error(
              '[PDF] FileReader error:',
              url
            );

            resolve(null);
          };


          reader.readAsDataURL(
            blob
          );
        }
      );

    } catch (error) {

      console.error(
        '[PDF] IMAGE LOAD FAILED:',
        path,
        error
      );

      // Do not stop PDF generation
      // if an image fails.
      return null;
    }
  }


  // =========================================================
  // GENERATE ASSIGNMENT REPORT
  // =========================================================

  async generateAssignmentReport(data: {

    title: string;

    description?: string;

    instructions?: string;

    code: string;

    language: string;

    output?: string;

    error?: string;

    aim?: string;

    tools?: string;

    theory?: string;

    learningOutcomes?: string;

    courseOutcomes?: string;

    conclusion?: string;

    rubric?: {

      correctness?: number;

      quality?: number;

      explanation?: number;

      totalMarks?: number;

      feedback?: string;

    };

  }): Promise<void> {


    // =======================================================
    // LOAD HEADER
    // =======================================================

    const headerImage =
      await this.loadImage(
        this.HEADER_PATH
      );


    // =======================================================
    // LOAD WATERMARK
    // =======================================================

    const watermarkImage =
      await this.loadImage(
        this.WATERMARK_PATH
      );


    console.log(
      '[PDF] Header available:',
      !!headerImage
    );


    console.log(
      '[PDF] Watermark available:',
      !!watermarkImage
    );


    // =======================================================
    // CREATE PDF
    // =======================================================

    const doc =
      new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });


    // =======================================================
    // PAGE DIMENSIONS
    // =======================================================

    const pageWidth =
      doc.internal.pageSize.getWidth();


    const pageHeight =
      doc.internal.pageSize.getHeight();


    const margin =
      18;


    const contentWidth =
      pageWidth -
      margin * 2;


    let y =
      20;


    // =======================================================
    // FONT
    // =======================================================

    // jsPDF built-in Times font.
    // Used as the Times New Roman equivalent.
    const FONT =
      'times';


    const BLACK =
      0;


    // =======================================================
    // HEADER IMAGE DIMENSIONS
    // =======================================================
    //
    // Uploaded header:
    // 980 x 128
    //
    // Keep original aspect ratio.
    //
    // =======================================================

    const headerWidth =
      pageWidth - 14;


    const pdfHeaderHeight =
      headerWidth *
      (128 / 980);


    const headerX =
      7;


    const headerY =
      5;


    // =======================================================
    // WATERMARK DIMENSIONS
    // =======================================================
    //
    // Uploaded watermark:
    // 666 x 640
    //
    // Keep original aspect ratio.
    //
    // =======================================================

    const watermarkWidth =
      95;


    const watermarkHeight =
      watermarkWidth *
      (640 / 666);


    const watermarkX =
      (
        pageWidth -
        watermarkWidth
      ) / 2;


    const watermarkY =
      95;


    // =======================================================
    // PAGE DESIGN
    // =======================================================

    const addPageDesign =
      (): void => {

        // ===================================================
        // WATERMARK
        // ===================================================
        //
        // Add watermark first so that it stays behind
        // the report text.
        //
        // ===================================================

        if (
          watermarkImage
        ) {

          try {

            doc.addImage(
              watermarkImage,
              'PNG',
              watermarkX,
              watermarkY,
              watermarkWidth,
              watermarkHeight
            );

          } catch (error) {

            console.error(
              '[PDF] Watermark could not be added:',
              error
            );
          }
        }


        // ===================================================
        // HEADER
        // ===================================================

        if (
          headerImage
        ) {

          try {

            doc.addImage(
              headerImage,
              'PNG',
              headerX,
              headerY,
              headerWidth,
              pdfHeaderHeight
            );

          } catch (error) {

            console.error(
              '[PDF] Header could not be added:',
              error
            );
          }
        }



        // ===================================================
        // CONTENT START POSITION
        // ===================================================

        y =
          38;
      };


    // =======================================================
    // PAGE BREAK
    // =======================================================

    const checkPageBreak =
      (
        requiredHeight: number = 10
      ): void => {

        if (
          y +
          requiredHeight >
          pageHeight - 18
        ) {

          doc.addPage();

          addPageDesign();
        }
      };


    // =======================================================
    // FIRST PAGE
    // =======================================================

    addPageDesign();


    // =======================================================
    // TITLE
    //
    // 16 PT
    // BOLD
    // CENTER
    // BLACK
    // =======================================================

    const addTitle =
      (
        title: string
      ): void => {

        checkPageBreak(
          20
        );


        doc.setFont(
          FONT,
          'bold'
        );


        doc.setFontSize(
          16
        );


        doc.setTextColor(
          BLACK
        );


        const lines =
          doc.splitTextToSize(
            title ||
            'Assignment Report',
            contentWidth
          );


        doc.text(
          lines,
          pageWidth / 2,
          y,
          {
            align: 'center'
          }
        );


        y +=
  lines.length * 7 +
  3;
      };


    // =======================================================
    // SECTION HEADING
    //
    // 14 PT
    // BOLD
    // BLACK
    //
    // NO LINE UNDER SECTION
    // =======================================================

    const addSectionHeading =
      (
        heading: string
      ): void => {

        checkPageBreak(
          18
        );


        doc.setFont(
          FONT,
          'bold'
        );


        doc.setFontSize(
          14
        );


        doc.setTextColor(
          BLACK
        );


        doc.text(
          heading,
          margin,
          y
        );


        y +=
          9;
      };


    // =======================================================
    // SUB HEADING
    //
    // 12 PT
    // BOLD
    // BLACK
    // =======================================================

    const addSubHeading =
      (
        heading: string
      ): void => {

        checkPageBreak(
          10
        );


        doc.setFont(
          FONT,
          'bold'
        );


        doc.setFontSize(
          12
        );


        doc.setTextColor(
          BLACK
        );


        const lines =
          doc.splitTextToSize(
            heading,
            contentWidth
          );


        doc.text(
          lines,
          margin,
          y
        );


        y +=
          lines.length * 5 +
          3;
      };


    // =======================================================
    // NORMAL TEXT
    //
    // 12 PT
    // NORMAL
    // BLACK
    // =======================================================

    const addParagraph =
      (
        text?: string
      ): void => {

        if (
          !text ||
          !text.trim()
        ) {

          text =
            'Not provided.';
        }


        doc.setFont(
          FONT,
          'normal'
        );


        doc.setFontSize(
          12
        );


        doc.setTextColor(
          BLACK
        );


        const lines =
          doc.splitTextToSize(
            text,
            contentWidth
          );


        for (
          const line of lines
        ) {

          checkPageBreak(
            7
          );


          doc.text(
            line,
            margin,
            y
          );


          y +=
            5.5;
        }


        y +=
          4;
      };


    // =======================================================
    // CODE / OUTPUT
    //
    // 12 PT
    // BLACK
    // =======================================================

    const addCodeBlock =
      (
        code: string
      ): void => {

        if (
          !code ||
          !code.trim()
        ) {

          code =
            '// No code submitted.';
        }


        doc.setFont(
          FONT,
          'normal'
        );


        doc.setFontSize(
          12
        );


        doc.setTextColor(
          BLACK
        );


        const lines =
          code.split('\n');


        for (
          const line of lines
        ) {

          const wrapped =
            doc.splitTextToSize(
              line || ' ',
              contentWidth
            );


          for (
            const wrappedLine of wrapped
          ) {

            checkPageBreak(
              7
            );


            doc.text(
              wrappedLine,
              margin,
              y
            );


            y +=
              5.5;
          }
        }


        y +=
          5;
      };


    // =======================================================
    // 1. AIM
    // =======================================================

    addTitle(
      data.title ||
      'Assignment Report'
    );


    addSectionHeading(
      '1. AIM'
    );


    addParagraph(
      data.aim ||
      data.description ||
      'Aim was not provided for this assignment.'
    );


    // =======================================================
    // 2. TOOLS
    // =======================================================

    addSectionHeading(
      '2. TOOLS'
    );


    addParagraph(
      data.tools ||
      `Programming Language: ${
        data.language ||
        'Not specified'
      }`
    );


    // =======================================================
    // 3. THEORY
    // =======================================================

    addSectionHeading(
      '3. THEORY'
    );


    addParagraph(
      data.theory ||
      data.instructions ||
      'Theory was not provided for this assignment.'
    );


    // =======================================================
    // 4. CODE
    // =======================================================

    addSectionHeading(
      '4. CODE'
    );


    addSubHeading(
      `Programming Language: ${
        data.language ||
        'Not specified'
      }`
    );


    addCodeBlock(
      data.code
    );


    // =======================================================
    // 5. OUTPUT
    // =======================================================

    addSectionHeading(
      '5. OUTPUT'
    );


    if (
      data.output &&
      data.output.trim()
    ) {

      addCodeBlock(
        data.output
      );

    } else if (
      data.error &&
      data.error.trim()
    ) {

      addSubHeading(
        'Execution Error'
      );


      addParagraph(
        data.error
      );

    } else {

      addParagraph(
        'No execution output was available when the report was generated.'
      );
    }


    // =======================================================
    // 6. LEARNING OUTCOMES
    // =======================================================

    addSectionHeading(
      '6. LEARNING OUTCOMES'
    );


    addParagraph(
      data.learningOutcomes ||
      'Learning outcomes were not provided for this assignment.'
    );


    // =======================================================
    // 7. COURSE OUTCOMES
    // =======================================================

    addSectionHeading(
      '7. COURSE OUTCOMES'
    );


    addParagraph(
      data.courseOutcomes ||
      'Course outcomes were not provided for this assignment.'
    );


    // =======================================================
    // 8. CONCLUSION
    // =======================================================

    addSectionHeading(
      '8. CONCLUSION'
    );


    addParagraph(
      data.conclusion ||
      'The assignment was completed and the submitted solution is included in this report.'
    );


    // =======================================================
    // 9. RUBRICS
    // =======================================================

    addSectionHeading(
      '9. RUBRICS'
    );


    // =======================================================
    // FOR FACULTY USE
    // =======================================================

    checkPageBreak(
      75
    );


    doc.setFont(
      FONT,
      'bold'
    );


    doc.setFontSize(
      12
    );


    doc.setTextColor(
      BLACK
    );


    doc.text(
      'For Faculty Use',
      pageWidth / 2,
      y,
      {
        align: 'center'
      }
    );


    const facultyWidth =
      doc.getTextWidth(
        'For Faculty Use'
      );


    doc.setLineWidth(
      0.2
    );


    doc.line(
      (
        pageWidth -
        facultyWidth
      ) / 2,
      y + 1,
      (
        pageWidth +
        facultyWidth
      ) / 2,
      y + 1
    );


    y +=
      9;


    // =======================================================
    // RUBRIC TABLE
    // =======================================================
    //
    // IMPORTANT:
    // This is intentionally kept as your existing rubric.
    //
    // =======================================================

    const tableX =
      margin;


    const colWidths = [
      30,
      30,
      30,
      30,
      contentWidth - 120
    ];


    // IMPORTANT:
    // Do NOT call this "headerHeight".
    // "headerHeight" is already used for the
    // TCET image.
    const rubricHeaderHeight =
      22;


    const marksHeight =
      35;


    const headers = [

      'Correction\nParameters',

      'Formative\nAssessment\n[40%]',

      'Timely\ncompletion\nof Practical\n[40%]',

      'Attendance /\nLearning\nAttitude\n[20%]',

      ''

    ];


    let currentX =
      tableX;


    // =======================================================
    // RUBRIC HEADER ROW
    // =======================================================

    doc.setFont(
      FONT,
      'bold'
    );


    doc.setFontSize(
      11
    );


    doc.setTextColor(
      BLACK
    );


    for (
      let i = 0;
      i < colWidths.length;
      i++
    ) {

      doc.rect(
        currentX,
        y,
        colWidths[i],
        rubricHeaderHeight
      );


      if (
        headers[i]
      ) {

        const lines =
          headers[i].split('\n');


        const lineHeight =
          4.5;


        const totalHeight =
          lines.length *
          lineHeight;


        let textY =
          y +
          (
            rubricHeaderHeight -
            totalHeight
          ) / 2 +
          3.5;


        for (
          const line of lines
        ) {

          doc.text(
            line,
            currentX +
            colWidths[i] / 2,
            textY,
            {
              align: 'center'
            }
          );


          textY +=
            lineHeight;
        }
      }


      currentX +=
        colWidths[i];
    }


    y +=
      rubricHeaderHeight;


    // =======================================================
    // MARKS OBTAINED ROW
    // =======================================================

    currentX =
      tableX;


    doc.setFont(
      FONT,
      'bold'
    );


    doc.setFontSize(
      11
    );


    doc.setTextColor(
      BLACK
    );


    for (
      let i = 0;
      i < colWidths.length;
      i++
    ) {

      doc.rect(
        currentX,
        y,
        colWidths[i],
        marksHeight
      );


      if (
        i === 0
      ) {

        doc.text(
          'Marks',
          currentX + 3,
          y + 9
        );


        doc.text(
          'Obtained',
          currentX + 3,
          y + 14
        );
      }


      currentX +=
        colWidths[i];
    }


    y +=
      marksHeight +
      10;


    // =======================================================
    // FOOTER
    // =======================================================

    const pageCount =
      doc.getNumberOfPages();


    for (
      let page = 1;
      page <= pageCount;
      page++
    ) {

      doc.setPage(
        page
      );


      doc.setFont(
        FONT,
        'normal'
      );


      doc.setFontSize(
        9
      );


      doc.setTextColor(
        BLACK
      );


      doc.text(
        'LabFlow - Assignment Report',
        margin,
        pageHeight - 8
      );


      doc.text(
        `Page ${page} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 8,
        {
          align: 'right'
        }
      );
    }


    // =======================================================
    // DOWNLOAD PDF
    // =======================================================

    const safeTitle =
      (
        data.title ||
        'assignment-report'
      )
        .replace(
          /[^a-zA-Z0-9-_ ]/g,
          ''
        )
        .trim()
        .replace(
          /\s+/g,
          '_'
        );


    const fileName =
      `${safeTitle}_Report.pdf`;


    console.log(
      '[PDF] Saving:',
      fileName
    );


    doc.save(
      fileName
    );


    console.log(
      '[PDF] Save completed'
    );
  }
}