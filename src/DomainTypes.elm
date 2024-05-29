module DomainTypes exposing (..)

import Time


type Grade
    = Passed
    | Failed
    | Neutral


type alias Card =
    { question : String
    , answer : String
    , last : Time.Posix
    , grade : Grade
    }


type alias Deck =
    { filename : String
    , cards : List Card
    }
