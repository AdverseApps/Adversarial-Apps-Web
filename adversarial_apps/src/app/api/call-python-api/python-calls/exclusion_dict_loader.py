from collections import defaultdict

import pandas as pd


def load_exclusion_dict_from_excel(excel_path: str) -> dict:
    df_exclusions = pd.read_csv(excel_path, dtype=str)

    # Rename and clean relevant columns
    df = df_exclusions.rename(
        columns={
            "Unique Entity ID": "uei",
            "Exclusion Type": "exclusion_type",
            "Excluding Agency": "excluding_agency",
            "Active Date": "ex_active_date",
            "Termination Date": "ex_termination_date",
        }
    )

    df = df[
        [
            "uei",
            "exclusion_type",
            "excluding_agency",
            "ex_active_date",
            "ex_termination_date",
        ]
    ]
    df["uei"] = df["uei"].str.upper().str.strip()
    df["ex_termination_date"] = df["ex_termination_date"].replace("Indefinite", pd.NA)

    exclusion_dict = defaultdict(list)
    for _, row in df.iterrows():
        exclusion_dict[row["uei"]].append(
            {
                "exclusion_type": row["exclusion_type"],
                "excluding_agency": row["excluding_agency"],
                "ex_active_date": row["ex_active_date"],
                "ex_termination_date": row["ex_termination_date"],
            }
        )

    return exclusion_dict
