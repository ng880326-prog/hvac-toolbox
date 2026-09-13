# Reference standards used to verify the workbook (not committed)

These PDFs are published by the Hong Kong Electrical and Mechanical Services Department (EMSD) and by
the standards bodies they cite. They are **downloaded on demand and deliberately not committed** — they
are third-party documents (33 MB in total) and the repository only needs their values, which are
transcribed with a source citation in the app data files.

| File | Source |
|---|---|
| `BEC_2012.pdf` | https://www.emsd.gov.hk/beeo/en/pee/BEC_2012.pdf |
| `BEC_2024_ENG.pdf` | https://www.emsd.gov.hk/beeo/en/pee/BEC_2024_ENG.pdf |
| `BEC2021vsBEC2024.pdf` | https://www.emsd.gov.hk/beeo/en/pee/BEC2021vsBEC2024.pdf |
| `tg_bec_2012.pdf` | https://www.emsd.gov.hk/beeo/en/pee/TG-BEC_2012%20(Rev.%201).pdf |
| `TG-BEC_2024.pdf` | https://www.emsd.gov.hk/beeo/en/pee/TG-BEC_2024.pdf |

The index page listing every Code of Practice and Technical Guidelines file is
<https://www.emsd.gov.hk/beeo/en/mibec_beeo_codtechguidelines.html>.

## How they were used

* **BEC 2012 Tables 6.11a / 6.11b / 6.11c** (pp. 23–26) — verified cell by cell against the workbook's
  hidden ranges `29_Insulations!AB10:AK25` and `AB50:AK52`; they are identical, which is how the
  blank template's data was recovered.
* **TG-BEC 2012 (Rev. 1) §6.11.1** — Equations (a) and (b), the 10 °C ductwork supplement, and the
  iterative procedure the workbook's broken `AP4:AS5003` simulation table was meant to perform.
* **BEC 2024 Tables 6.11a / 6.11b / 6.11c** (pp. 32–34) and **TG-BEC 2024 §6.11.1** Tables 6.11.1(a)
  and 6.11.1(e) — the current edition's thickness tables, the new ceiling-void ambient condition, the
  λ = 0.038 column and the commercial product sizes.

## Re-download

```powershell
New-Item -ItemType Directory -Force -Path analysis\refs | Out-Null
Invoke-WebRequest 'https://www.emsd.gov.hk/beeo/en/pee/BEC_2024_ENG.pdf' -OutFile analysis\refs\BEC_2024_ENG.pdf
Invoke-WebRequest 'https://www.emsd.gov.hk/beeo/en/pee/TG-BEC_2024.pdf'   -OutFile analysis\refs\TG-BEC_2024.pdf
```

Helpers that read these files:

* `python tools/find_bec_insulation.py <pdf> [needle ...]` — print every page containing all needles.
* `python tools/pdf_pages.py <pdf> <first> <last> [needle ...]` — print a page range (1-based,
  inclusive), optionally filtered.
