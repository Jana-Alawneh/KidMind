import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";


const safeFileName = value => {
  return String(
    value ||
    "KidMind-Report.pdf"
  )
    .replace(
      /[\\/:*?"<>|]+/g,
      "-"
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
};


export const downloadElementAsPdf =
  async ({
    element,
    filename,
    backgroundColor = "#FFFFFF",
    marginMm = 8,
  }) => {

    if (!element) {
      throw new Error(
        "Report content is not available."
      );
    }


    if (
      document.fonts?.ready
    ) {
      await document.fonts.ready;
    }


    element.setAttribute(
      "data-pdf-capture-root",
      "true"
    );


    try {

      const canvas =
        await html2canvas(
          element,
          {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor,
            logging: false,
            width:
              element.scrollWidth,
            height:
              element.scrollHeight,
            windowWidth:
              Math.max(
                element.scrollWidth,
                document.documentElement
                  .clientWidth
              ),
            windowHeight:
              Math.max(
                element.scrollHeight,
                document.documentElement
                  .clientHeight
              ),
            scrollX: 0,
            scrollY: 0,
            ignoreElements:
              node =>
                node?.getAttribute?.(
                  "data-pdf-ignore"
                ) === "true",
            onclone:
              clonedDocument => {

                const root =
                  clonedDocument
                    .querySelector(
                      "[data-pdf-capture-root='true']"
                    );


                if (root) {
                  root.style.maxHeight =
                    "none";
                  root.style.height =
                    "auto";
                  root.style.overflow =
                    "visible";
                  root.style.boxShadow =
                    "none";
                }

              },
          }
        );


      if (
        !canvas.width ||
        !canvas.height
      ) {
        throw new Error(
          "The report could not be rendered."
        );
      }


      const pdf =
        new jsPDF({
          orientation:
            "portrait",
          unit:
            "mm",
          format:
            "a4",
          compress:
            true,
        });


      const pageWidth =
        pdf.internal.pageSize
          .getWidth();

      const pageHeight =
        pdf.internal.pageSize
          .getHeight();

      const contentWidth =
        pageWidth -
        marginMm * 2;

      const contentHeight =
        pageHeight -
        marginMm * 2;

      const pixelsPerMm =
        canvas.width /
        contentWidth;

      const pageHeightPx =
        Math.max(
          1,
          Math.floor(
            contentHeight *
            pixelsPerMm
          )
        );


      let sourceY = 0;
      let pageIndex = 0;


      while (
        sourceY <
        canvas.height
      ) {

        const sliceHeight =
          Math.min(
            pageHeightPx,
            canvas.height -
            sourceY
          );

        const pageCanvas =
          document.createElement(
            "canvas"
          );

        pageCanvas.width =
          canvas.width;

        pageCanvas.height =
          sliceHeight;


        const context =
          pageCanvas.getContext(
            "2d"
          );


        if (!context) {
          throw new Error(
            "The PDF canvas could not be created."
          );
        }


        context.fillStyle =
          backgroundColor;

        context.fillRect(
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );

        context.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );


        const imageData =
          pageCanvas.toDataURL(
            "image/jpeg",
            0.95
          );

        const imageHeightMm =
          sliceHeight /
          pixelsPerMm;


        if (
          pageIndex > 0
        ) {
          pdf.addPage();
        }


        pdf.addImage(
          imageData,
          "JPEG",
          marginMm,
          marginMm,
          contentWidth,
          imageHeightMm,
          undefined,
          "FAST"
        );


        sourceY +=
          sliceHeight;

        pageIndex += 1;

      }


      const finalName =
        safeFileName(
          filename
        );


      pdf.save(
        finalName
          .toLowerCase()
          .endsWith(
            ".pdf"
          )
          ? finalName
          : `${finalName}.pdf`
      );

    } finally {

      element.removeAttribute(
        "data-pdf-capture-root"
      );

    }

  };